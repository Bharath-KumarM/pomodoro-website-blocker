import {
  handlePomoStart, handlePomoPause, handlePomoStop, 
  handlePomoReset, pushNotification, updatePomoHistory
} from './pomoHelper'

import { getDateString, getDayNumber } from '../../utilities/date'
import { localLogMessage } from '../../utilities/localStorage'
import { refreshRestrictedSites, turnOnFocusMode } from './restrictSiteBG'
import { getCurrentTime } from './helper'
import { getIsScreenTimeSurpassedLimit } from '../../utilities/chromeApiTools'
import { getIsTimeBtwFocusSchedule } from '../../utilities/focusModeHelper'


console.log('Script running from background!!!')

// Runtime Log 
chrome.storage.local.get('BGtimeLog', ({BGtimeLog})=>{
  const MAX_LEN = 100

  if (!BGtimeLog) BGtimeLog = []
  BGtimeLog.push(new Date().toString().slice(0, 25))
  console.log(BGtimeLog)

  BGtimeLog.slice(Math.max(BGtimeLog.length - MAX_LEN, 0))
  chrome.storage.local.set({BGtimeLog})

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
  // Take A Break alarm ends for focus mode
  if (name.startsWith('focusModeTakeABreak')){
    turnOnFocusMode(name)
    chrome.storage.local.set({focusModeTakeABreakTracker: false})

  }
  // Take A Break alarm ends for schedule
  if (name.startsWith('scheduleTakeABreak')){
    chrome.storage.local.set({focusModeTakeABreakTracker: false})
    refreshRestrictedSites()
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
  if (url){
    const currDateString = getDateString(0)
    const hostname = new URL(url).hostname;

    let {noOfVisitsTracker} = await chrome.storage.local.get('noOfVisitsTracker')
    if (!noOfVisitsTracker) noOfVisitsTracker = {}
    if (!noOfVisitsTracker[currDateString]) noOfVisitsTracker[currDateString] = {}

    // *To identify the same tab reload the same site again
    let isValidVisitCount = true
    if (!noOfVisitsTracker[currDateString][hostname]) noOfVisitsTracker[currDateString][hostname] = [tabId, 0]
    else{
      if (noOfVisitsTracker[currDateString][hostname][0] === tabId) isValidVisitCount = false
    }
    if (isValidVisitCount){
      noOfVisitsTracker[currDateString][hostname][1]++
      chrome.storage.local.set({noOfVisitsTracker})
    }

  }

  // handle new site 
  // todo: waiting for favIconurl can slow down a bit
  if (!tab.url || !tab.url.startsWith('http') || !tab.favIconUrl) return;
  
  const hostname = new URL(tab.url).hostname;
  const favIconUrl = tab.favIconUrl
  
  const {blockedSites} = await chrome.storage.local.get('blockedSites')

  if (blockedSites[hostname]){
    // *Remember hostname and favIcon based on tab id
    let {blockedScreenData} = await chrome.storage.local.get('blockedScreenData')
    if (!blockedScreenData) blockedScreenData = {}
    
    blockedScreenData[tabId] = [hostname, favIconUrl, tab.url]
    await chrome.storage.local.set({blockedScreenData})
  
    chrome.tabs.update(tabId, {
      url: chrome.runtime.getURL(`/src/pages/blocked-screen/blocked-screen.html`) 
    })
    return null;
  }

  //* Focus mode & Restriction site load handeling
  // todo: can be efficient
  const {focusModeTracker} = await chrome.storage.local.get('focusModeTracker')
  const {restrictedSites} = await chrome.storage.local.get('restrictedSites')
  const isTimeBtwFocusSchedule = await getIsTimeBtwFocusSchedule()
  const {focusModeTakeABreakTracker} = await chrome.storage.local.get('focusModeTakeABreakTracker')


  if ((restrictedSites[hostname] && !focusModeTakeABreakTracker) && (focusModeTracker || isTimeBtwFocusSchedule)){
    // *Remember hostname and favIcon based on tab id
    let {restrictedScreenData} = await chrome.storage.local.get('restrictedScreenData')
    if (!restrictedScreenData) restrictedScreenData = {} //Initializing step
    
    restrictedScreenData[tabId] = [hostname, favIconUrl, tab.url]
    await chrome.storage.local.set({restrictedScreenData})
  
    chrome.tabs.update(tabId, {
      url: chrome.runtime.getURL(`/src/pages/restricted-screen/restricted-screen.html`) 
    })
    return null;
  }

  // * Time Limit
  const isScreenTimeSurpassedLimit = await getIsScreenTimeSurpassedLimit(hostname)
  if (isScreenTimeSurpassedLimit){
    // *Remember hostname and favIcon based on tab id, can be used in time limit screens
    let {timeLimitScreenData} = await chrome.storage.local.get('timeLimitScreenData')
    if (!timeLimitScreenData) timeLimitScreenData = {} //Initializing step
    
    timeLimitScreenData[tabId] = [hostname, favIconUrl, tab.url]
    await chrome.storage.local.set({timeLimitScreenData})

    chrome.tabs.update(tabId, {
      url: chrome.runtime.getURL(`/src/pages/time-limit-screen/time-limit-screen.html`) 
    })
    return null;
  }


  
})


// *Handles Tab Remove
chrome.tabs.onRemoved.addListener( async (tabId, removeInfo)=>{
    const {blockedScreenData} = await chrome.storage.local.get('blockedScreenData')
    if (blockedScreenData && blockedScreenData[tabId]) {
      delete blockedScreenData[tabId]
      chrome.storage.local.set({blockedScreenData})
    }
    
    const {restrictedSiteData} = await chrome.storage.local.get('restrictedSiteData')
    if (restrictedSiteData && restrictedSiteData[tabId]){
      delete restrictedSiteData[tabId]
      chrome.storage.local.set({restrictedSiteData})
    }

    const {timeLimitScreenData} = await chrome.storage.local.get('timeLimitScreenData')
    if (timeLimitScreenData && timeLimitScreenData[tabId]){
      delete timeLimitScreenData[tabId]
      chrome.storage.local.set({timeLimitScreenData})
    }
    
  })

