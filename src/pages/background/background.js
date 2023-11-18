import { checkScreenTimeSurpassedLimit } from '../../utilities/chrome-tools/chromeApiTools'
import { checkFocusScheduleActive } from '../../utilities/focusModeHelper'

import { delLocalBlockedScreenDataByTabId, updateLocalBlockedScreenDataByTab } from '../../localStorage/localBlockedScreenData'
import { delLocalRestrictedScreenDataByTabId, updateLocalRestrictedScreenDataByTab } from '../../localStorage/localRestrictedScreenData'
import { delLocalTimeLimitScreenDataByTabId, updateLocalTimeLimitScreenDataByTab } from '../../localStorage/localTimeLimitScreenData'

import { getLocalFocusModeTracker } from '../../localStorage/localFocusModeTracker'
import { getLocalTakeABreakTrackerforRestrict, handleTakeABreakClick, turnOffLocalTakeABreakTrackerforRestrict } from '../../localStorage/localTakeABreakTrackerforRestrict'
import { handleOnInstallEvent } from './installEvents'
import { handleOnStartUpEvent } from './onStartupEvents'
import { checkLocalVisitTabIdTrackerNewSession, delLocalVisitTabIdTracker } from '../../localStorage/localVisitTrackerTabId'
import { incrementLocalVisitTracker } from '../../localStorage/localVisitTracker'
import { handleUpdateBadgeIcon } from './helper'
import { createWelcomeScreencreenTab } from '../../utilities/chrome-tools/forceTabs'
import { getHost } from '../../utilities/simpleTools'
import { checkRestrictedSites, checkSiteTagging, getRestrictedSites, handleBlockUnblockSite } from '../../localStorage/localSiteTagging'

import { registerContentScripts } from '../../utilities/contentScript'
import { getLocalSettingsData } from '../../localStorage/localSettingsData'

console.log('Script running from background!!!')
// Periodically updated data
let settingsData;
getLocalSettingsData({}).then(val=> settingsData = val)

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
  turnOffLocalTakeABreakTrackerforRestrict({isForceTurnOff: true, shouldRefreshSites: false})
  

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
      updateBadgeIcon,
      updateLocalTimeLimitScreenDataByTabMsg,
      handleTurnOffLocalTakeABreakTrackerforRestrict,
      createTakeABreak
     } = request

  if (getTabId){
    sendResponse({tabId: sender.tab.id})
  }

  if (checkCurrentTabAudible){
    if (settingsData['should-count-screen-time-bg-audio'] === false){
      sendResponse({audible: false})
    } else {
      sendResponse({audible: sender.tab.audible})
    }
  }

  if (updateBadgeIcon){
    const {hostname} = updateBadgeIcon
    const tabId = sender.tab.id

    const {isBadgeUpdated} = handleUpdateBadgeIcon({tabId, hostname}).then(()=>{

      sendResponse({isBadgeUpdated})
    })
    
  }

  if (updateLocalTimeLimitScreenDataByTabMsg){
    const [tabId, [hostname, favIconUrl, url]] = updateLocalTimeLimitScreenDataByTabMsg
    updateLocalTimeLimitScreenDataByTab(tabId, [hostname, favIconUrl, url]).then(()=>{
      sendResponse(true)
    })
  }

  if (handleTurnOffLocalTakeABreakTrackerforRestrict){
    turnOffLocalTakeABreakTrackerforRestrict({isForceTurnOff: true, shouldRefreshSites: true}).then(()=>{
      sendResponse(true)
    })
  }
  
  if(createTakeABreak){
    turnOffLocalTakeABreakTrackerforRestrict({isForceTurnOff: true, shouldRefreshSites: false}).then(()=>{
      const {timeInMinutes} = createTakeABreak
      handleTakeABreakClick(timeInMinutes).then(()=>{
        sendResponse(true)
      })
    })
    


  }
  return true;
})

//* Handles alarm
chrome.alarms.onAlarm.addListener(async ({name})=>{
  // name = 'takeABreakForRestrict' ||'takeABreakForRestrictBefore2minute' || 'takeABreakForRestrictBefore1minute'

  // Take A Break alarm ends for restricting sites
  if (name.startsWith('takeABreakForRestrict')){
    if (name === 'takeABreakForRestrict'){
      turnOffLocalTakeABreakTrackerforRestrict({isForceTurnOff: false, shouldRefreshSites: true})
    }
    else{
      let restrictedSites = await getRestrictedSites()

      let takeABreakForRestrictRemainingMinutes
      if (name === 'takeABreakForRestrictBefore2minute'){
        takeABreakForRestrictRemainingMinutes = 2
      }
      else if (name === 'takeABreakForRestrictBefore1minute'){
        takeABreakForRestrictRemainingMinutes = 1
      }
      if (!takeABreakForRestrictRemainingMinutes){
        return null
      }

      for (const hostname of restrictedSites){
        const tabs = await chrome.tabs.query({url: `*://${hostname}/*` })
        for (const {id} of tabs){
          const response = await chrome.tabs.sendMessage(id, {takeABreakForRestrictRemainingMinutes})
        }
      }
    }
  }
})

//* Handles URL updates
// Todo: is it readly needed? isn't runAt fast enough? 
chrome.webNavigation.onBeforeNavigate.addListener( async (details)=>{
    const {tabId, url, frameType} = details
    if (frameType === "outermost_frame"){
      handleUrlUpdate({tabId, url})
    }
  }, 
  {url: [{urlPrefix: 'http'}]}
)
chrome.tabs.onUpdated.addListener( async ( tabId, {url, audible}, tab )=>{
  if (audible !== undefined){
    if (settingsData['should-count-screen-time-bg-audio']){
      handleAudibleUpdate({tabId, url: tab.url, audible})
    }
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

// *Handles context menu click
chrome.contextMenus.onClicked.addListener((info, tab)=>{
  if (info.pageUrl){
    const hostname = getHost(info.pageUrl)
    handleBlockUnblockSite({
      hostname,
      shouldBlockSite: true,
    })
  }
})

registerContentScripts()


chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key === 'settingsData'){
      handleSetiingsDataChange(newValue)
    }
    // console.log(
    //   `Storage key "${key}" in namespace "${namespace}" changed.`,
    //   `Old value was "${oldValue}", new value is "${newValue}".`
    // );
  }
});

// Helper functions
async function handleAudibleUpdate({tabId, url, audible}){
  const response = await chrome.tabs.sendMessage(tabId, {audibleInfo: {audible}});

}

async function handleSetiingsDataChange(newSettingsData){

  settingsData = newSettingsData

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
  
  const isBlockedSite = await checkSiteTagging({hostname, checkBlockedSite: true})

  if (isBlockedSite){
    updateLocalBlockedScreenDataByTab(tabId, [hostname, favIconUrl, url])
    return null;
  }

  //* Focus mode & Restriction site load handeling
  const {focusModeTracker} = await getLocalFocusModeTracker()
  const isRestricted = await checkRestrictedSites(hostname)
  const isCurrTimeFocusScheduled = await checkFocusScheduleActive()
  const {takeABreakTrackerforRestrict} = await getLocalTakeABreakTrackerforRestrict()


  if (isRestricted && !takeABreakTrackerforRestrict && (focusModeTracker || isCurrTimeFocusScheduled)){
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
