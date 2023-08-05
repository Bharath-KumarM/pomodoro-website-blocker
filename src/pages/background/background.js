import { checkScreenTimeSurpassedLimit } from '../../utilities/chrome-tools/chromeApiTools'
import { checkFocusScheduleActive } from '../../utilities/focusModeHelper'

import { delLocalBlockedScreenDataByTabId, updateLocalBlockedScreenDataByTab } from '../../localStorage/localBlockedScreenData'
import { delLocalRestrictedScreenDataByTabId, updateLocalRestrictedScreenDataByTab } from '../../localStorage/localRestrictedScreenData'
import { delLocalTimeLimitScreenDataByTabId, updateLocalTimeLimitScreenDataByTab } from '../../localStorage/localTimeLimitScreenData'

import {checkLocalBlockedSitesByHostname} from '../../localStorage/localBlockedSites'
import { checkLocalRestrictedSitesByHostname } from '../../localStorage/localRestrictedSites'
import { getLocalFocusModeTracker } from '../../localStorage/localFocusModeTracker'
import { getLocalTakeABreakTrackerforRestrict, turnOffLocalTakeABreakTrackerforRestrict } from '../../localStorage/localTakeABreakTrackerforRestrict'
import { handleOnInstallEvent } from './installEvents'
import { handleOnStartUpEvent } from './onStartupEvents'
import { checkLocalVisitTabIdTrackerNewSession, delLocalVisitTabIdTracker } from '../../localStorage/localVisitTrackerTabId'
import { incrementLocalVisitTracker } from '../../localStorage/localVisitTracker'
import { handleUpdateBadgeIcon } from './helper'
import { createWelcomeScreencreenTab } from '../../utilities/chrome-tools/forceTabs'


console.log('Script running from background!!!')

chrome.action.setBadgeBackgroundColor({ color: [175, 227, 255, 255] });

// Runtime Log 
chrome.storage.local.get('BGtimeLog', ({BGtimeLog})=>{
  const MAX_LEN = 100

  const newBGtimeLog = BGtimeLog.slice(-MAX_LEN)
  console.log(newBGtimeLog)
  
  newBGtimeLog.push(new Date().toString().slice(0, 25))

  chrome.storage.local.set({BGtimeLog: newBGtimeLog})

})

//* On Install or Update event or reloaded the package
chrome.runtime.onInstalled.addListener(({id, previousVersion, reason})=>{
  handleOnInstallEvent()

  // reason = 'install' || 'update' || 'chrome_update' || 'shared_module_update'

  console.log(`onInstalled reason: ${reason}`, Date ().toLocaleString())

  if (['install', 'update', 'shared_module_update'].includes(reason)){
    createWelcomeScreencreenTab()
  }
  
})

// * Handles new session opened
chrome.runtime.onStartup.addListener(()=>{
  handleOnStartUpEvent()
  console.log(`Onstartup reason`, Date ().toLocaleString())
})

//* Handle messages from  runtime
chrome.runtime.onMessage.addListener((request, sender, sendResponse)=> {
  // Request Types
  
  const { 
      msg, 
      getTabId,
      checkCurrentTabAudible,
      updateBadgeIcon
     } = request

  if (getTabId){
    sendResponse({tabId: sender.tab.id})
  }

  if (checkCurrentTabAudible){
    sendResponse({audible: sender.tab.audible})
  }

  if (updateBadgeIcon){
    const {hostname} = updateBadgeIcon
    const tabId = sender.tab.id

    handleUpdateBadgeIcon({tabId, hostname}).then(isBadgeUpdated=>{
      sendResponse({isBadgeUpdated})
    })
    
  }

  return true;
})

//* Handles alarm
chrome.alarms.onAlarm.addListener(({name})=>{
  // Take A Break alarm ends for restricting sites
  if (name.startsWith('takeABreakForRestrict')){
    turnOffLocalTakeABreakTrackerforRestrict(true)
  }
})

//* Handles URL updates
chrome.webNavigation.onBeforeNavigate.addListener( async (details)=>{
    const {tabId, url} = details
    handleUrlUpdate({tabId, url})
  }, 
  {url: [
    {urlPrefix: 'http'},
  ]}
)
chrome.tabs.onUpdated.addListener( async ( tabId, {url, audible}, tab )=>{
  if (audible !== undefined){
    
    handleAudibleUpdate({tabId, url: tab.url, audible})
  }
  if (url){
    handleUrlUpdateForVisitCount({tabId, url})
    handleUrlUpdate({tabId, url})
  }
})

// *Handles Tab closes
chrome.tabs.onRemoved.addListener( async (tabId, removeInfo)=>{
    delLocalVisitTabIdTracker(tabId)
    delLocalBlockedScreenDataByTabId(tabId)
    delLocalRestrictedScreenDataByTabId(tabId)
    delLocalTimeLimitScreenDataByTabId(tabId)
  })

// Helper functions
async function handleAudibleUpdate({tabId, url, audible}){
  const response = await chrome.tabs.sendMessage(tabId, {audibleInfo: {audible}});

}
async function handleUrlUpdateForVisitCount({tabId, url}){
  // handle new site 
  if (!url || !url.startsWith('http')) return;
  
  const hostname = new URL(url).hostname;
  const favIconUrl = `http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`;
  
  const isNewSession = await checkLocalVisitTabIdTrackerNewSession(tabId, hostname)
  if (!isNewSession){
    return null;
  }

  const incrementCount = await incrementLocalVisitTracker(hostname)
}
async function handleUrlUpdate({tabId, url}){

  // handle new site 
  if (!url || !url.startsWith('http')) return;
  
  const hostname = new URL(url).hostname;
  const favIconUrl = `http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`;
  
  const isBlockedSite = await checkLocalBlockedSitesByHostname(hostname)

  if (isBlockedSite){
    updateLocalBlockedScreenDataByTab(tabId, [hostname, favIconUrl, url])
    return null;
  }

  //* Focus mode & Restriction site load handeling
  const {focusModeTracker} = await getLocalFocusModeTracker()
  const isRestricted = await checkLocalRestrictedSitesByHostname(hostname)
  const isCurrTimeFocusScheduled = await checkFocusScheduleActive()
  const {takeABreakTrackerforRestrict} = await getLocalTakeABreakTrackerforRestrict()


  if ((isRestricted && !takeABreakTrackerforRestrict) && (focusModeTracker || isCurrTimeFocusScheduled)){
    await updateLocalRestrictedScreenDataByTab(tabId, [hostname, favIconUrl, url])
    return null;
  }

  // * Time Limit
  const isScreenTimeSurpassedLimit = await checkScreenTimeSurpassedLimit(hostname)
  if (isScreenTimeSurpassedLimit){
    await updateLocalTimeLimitScreenDataByTab(tabId, [hostname, favIconUrl, url])
    return null;
  }
}


