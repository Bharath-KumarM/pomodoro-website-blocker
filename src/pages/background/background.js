import {
  handlePomoStart, handlePomoPause, handlePomoStop, 
  handlePomoReset, pushNotification, updatePomoHistory
} from './pomoHelper'

import { getDateString } from '../../utilities/date'

import { getIsScreenTimeSurpassedLimit } from '../../utilities/chrome-tools/chromeApiTools'
import { checkFocusScheduleActive } from '../../utilities/focusModeHelper'

import { delLocalBlockedScreenDataByTabId, updateLocalBlockedScreenDataByTab } from '../../localStorage/localBlockedScreenData'
import { delLocalRestrictedScreenDataByTabId, updateLocalRestrictedScreenDataByTab } from '../../localStorage/localRestrictedScreenData'
import { delLocalTimeLimitScreenDataByTabId, updateLocalTimeLimitScreenDataByTab } from '../../localStorage/localTimeLimitScreenData'
import { getLocalNoOfVisitsTracker, setLocalNoOfVisitsTracker } from '../../localStorage/localNoOfVisitsTracker'

import {checkLocalBlockedSitesByHostname} from '../../localStorage/localBlockedSites'
import { getLocalRestrictedSites } from '../../localStorage/localRestrictedSites'
import { getLocalFocusModeTracker } from '../../localStorage/localFocusModeTracker'
import { getLocalTakeABreakTrackerforRestrict, turnOffLocalTakeABreakTrackerforRestrict } from '../../localStorage/localTakeABreakTrackerforRestrict'

console.log('Script running from background!!!')

// Runtime Log 
chrome.storage.local.get('BGtimeLog', ({BGtimeLog})=>{
  const MAX_LEN = 100

  const newBGtimeLog = BGtimeLog.slice(-MAX_LEN)
  console.log(newBGtimeLog)
  
  newBGtimeLog.push(new Date().toString().slice(0, 25))

  chrome.storage.local.set({BGtimeLog: newBGtimeLog})

})

chrome.alarms.onAlarm.addListener(({name})=>{
  if (name === 'pomodoro_alarm_id'){
    chrome.storage.local.get('pomoData', ({pomoData})=>{
      chrome.storage.local.set({pomoData: {
        ...pomoData, 
        mode: 'done'
      }}, ()=>{
        updatePomoHistory(pomoData)
        chrome.runtime.sendMessage({pomoData: {...pomoData, mode: 'done'}})
        pushNotification(pomoData)
      })
    })
  }
  // Take A Break alarm ends for restricting sites
  if (name.startsWith('takeABreakForRestrict')){
    turnOffLocalTakeABreakTrackerforRestrict(true)
  }
})


// Message Listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse)=> {
  // Request Types
  const { pomoData, msg, getTabId } = request

  if (getTabId){
    sendResponse({tabId: sender.tab.id})
    return null;
  }

  // Pomodoro Data
  if (pomoData){
    chrome.alarms.clear(
      'pomodoro_alarm_id',
      ()=>{
        if (msg === 'start') handlePomoStart(pomoData)
        if (msg  === 'pause') handlePomoPause(pomoData)
        if (msg === 'reset') handlePomoReset()
        if (msg === 'stop') handlePomoStop(pomoData)
      }
    )
  }

  return true
});

chrome.tabs.onUpdated.addListener( async (tabId, {url}, tab)=>{

  //Track Visits or Opens
  if (url && url.startsWith('http')){
    const currDateString = getDateString(0)
    const hostname = new URL(url).hostname;

    let {noOfVisitsTracker} = await getLocalNoOfVisitsTracker()
    if (!noOfVisitsTracker[currDateString]) noOfVisitsTracker[currDateString] = {}

    // *To identify the same tab reload the same site again
    let isValidVisitCount = true
    if (!noOfVisitsTracker[currDateString][hostname]) noOfVisitsTracker[currDateString][hostname] = [tabId, 0]
    else{
      if (noOfVisitsTracker[currDateString][hostname][0] === tabId) isValidVisitCount = false
    }
    if (isValidVisitCount){
      noOfVisitsTracker[currDateString][hostname][1]++
      setLocalNoOfVisitsTracker(noOfVisitsTracker)
    }

  }

  // handle new site 
  // todo: waiting for favIconurl can slow down forcing screen a bit
  if (!tab.url || !tab.url.startsWith('http') || !tab.favIconUrl) return;
  
  const hostname = new URL(tab.url).hostname;
  const favIconUrl = tab.favIconUrl
  
  const isBlockedSite = await checkLocalBlockedSitesByHostname(hostname)

  if (isBlockedSite){
    updateLocalBlockedScreenDataByTab(tabId, [hostname, favIconUrl, tab.url])
    return null;
  }

  //* Focus mode & Restriction site load handeling
  // todo: can be efficient
  const {focusModeTracker} = await getLocalFocusModeTracker()
  const {restrictedSites} = await getLocalRestrictedSites()
  const isCurrTimeFocusScheduled = await checkFocusScheduleActive()
  const {takeABreakTrackerforRestrict} = await getLocalTakeABreakTrackerforRestrict()


  if ((restrictedSites[hostname] && !takeABreakTrackerforRestrict) && (focusModeTracker || isCurrTimeFocusScheduled)){
    await updateLocalRestrictedScreenDataByTab(tabId, [hostname, favIconUrl, tab.url])
    return null;
  }

  // * Time Limit
  const isScreenTimeSurpassedLimit = await getIsScreenTimeSurpassedLimit(hostname)
  if (isScreenTimeSurpassedLimit){
    await updateLocalTimeLimitScreenDataByTab(tabId, [hostname, favIconUrl, tab.url])
    return null;
  }


  
})


// *Handles Tab Remove
chrome.tabs.onRemoved.addListener( async (tabId, removeInfo)=>{
    delLocalBlockedScreenDataByTabId(tabId)
    delLocalRestrictedScreenDataByTabId(tabId)
    delLocalTimeLimitScreenDataByTabId(tabId)
  })

// On Install or Update event or reloaded the package
chrome.runtime.onInstalled.addListener(()=>{
  console.log('onInstalled')
  handleOnInstallEvent()

})

async function handleOnInstallEvent (){
  // *Initialize browser storage local 
  // BlockedSites
  const {blockedScreenData} = await chrome.storage.local.get('blockedScreenData')
  if (blockedScreenData === undefined){
    await chrome.storage.local.set({blockedScreenData: {}})
  }
  const {blockedSites} = await chrome.storage.local.get('blockedSites')
  if (blockedSites === undefined){
    await chrome.storage.local.set({blockedSites: {}})
  }

  // Focus Mode & Restricted Sites 
  const {focusModeTracker} = await chrome.storage.local.get('focusModeTracker')
  if (focusModeTracker === undefined){
    await chrome.storage.local.set({focusModeTracker: false})
  }
  const {restrictedScreenData} = await chrome.storage.local.get('restrictedScreenData')
  if (restrictedScreenData === undefined){
    await chrome.storage.local.set({restrictedScreenData: {}})
  }
  const {restrictedSites} = await chrome.storage.local.get('restrictedSites')
  if (restrictedSites === undefined){
    await chrome.storage.local.set({restrictedSites: {}})
  }

  // ScreenTime and Visits
  const {screenTimeLimit} = await chrome.storage.local.get('screenTimeLimit')
  if (screenTimeLimit === undefined){
    await chrome.storage.local.set({screenTimeLimit: {}})
  }
  const {screenTimeTracker} = await chrome.storage.local.get('screenTimeTracker')
  if (screenTimeTracker === undefined){
    await chrome.storage.local.set({screenTimeTracker: {}})
  }
  const {timeLimitScreenData} = await chrome.storage.local.get('timeLimitScreenData')
  if (timeLimitScreenData === undefined){
    await chrome.storage.local.set({timeLimitScreenData: {}})
  }
  const {noOfVisitsTracker} = await chrome.storage.local.get('noOfVisitsTracker')
  if (noOfVisitsTracker === undefined){
    await chrome.storage.local.set({noOfVisitsTracker: {}})
  }

  // Schedule & takeAbreakforRestrict
  const {scheduleData} = await chrome.storage.local.get('scheduleData')
  if (scheduleData === undefined){
    await chrome.storage.local.set({scheduleData: []})
  }
  const {takeABreakTrackerforRestrict} = await chrome.storage.local.get('takeABreakTrackerforRestrict')
  if (takeABreakTrackerforRestrict === undefined){
    await chrome.storage.local.set({takeABreakTrackerforRestrict: false})
  }

  // Miscelleneous
  const {BGtimeLog} = await chrome.storage.local.get('BGtimeLog')
  if (BGtimeLog === undefined){
    await chrome.storage.local.set({BGtimeLog: []})
  }
  const {logMassage} = await chrome.storage.local.get('logMassage')
  if (logMassage === undefined){
    await chrome.storage.local.set({logMassage: []})
  }
} 