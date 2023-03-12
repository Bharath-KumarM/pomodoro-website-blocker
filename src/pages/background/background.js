import {
  handlePomoStart, handlePomoPause, handlePomoStop, 
  handlePomoReset, pushNotification, updatePomoHistory
} from './pomoHelper'

import { handleMsgFromBlockSiteUI, handleTakeBreakAlarm } from './blockSiteBG'
import { getDateString } from '../../utilities/date'


console.log('Script running from background!!!')

// Runtime Log 
chrome.storage.local.get('BGtimeLog', ({BGtimeLog})=>{
  if (!BGtimeLog) BGtimeLog = []
  BGtimeLog.push(new Date().toString().slice(0, 25))
  console.log(BGtimeLog)
  chrome.storage.local.set({BGtimeLog: BGtimeLog})

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
  // Take A Break
  if (name.startsWith('takeABreak')){
    handleTakeBreakAlarm(name)
  }
})




// Message Listener
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse)=> {
  // Request Types
  const { pomoData, blockSitesData, msg } = request

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

  if(blockSitesData) handleMsgFromBlockSiteUI(blockSitesData, msg, sendResponse)


});

chrome.tabs.onUpdated.addListener( async (tabId, {url}, tab)=>{

  if (url){
    const currDateString = getDateString(0)
    const hostname = new URL(url).hostname;

    let {noOfVisitsTracker} = await chrome.storage.local.get('noOfVisitsTracker')
    if (!noOfVisitsTracker) noOfVisitsTracker = {}
    if (!noOfVisitsTracker[currDateString]) noOfVisitsTracker[currDateString] = {}
    if (!noOfVisitsTracker[currDateString][hostname]) noOfVisitsTracker[currDateString][hostname] = 0
    noOfVisitsTracker[currDateString][hostname]++

    chrome.storage.local.set({noOfVisitsTracker})
  }

  if (!tab.url || !tab.url.startsWith('http') || !tab.favIconUrl) return 
  
  const hostname = new URL(tab.url).hostname;
  const favIconUrl = tab.favIconUrl
  
  const {blockedSites} = await chrome.storage.local.get('blockedSites')
  if (!blockedSites[hostname]) return;
  
  let {blockedScreenData} = await chrome.storage.local.get('blockedScreenData')
  if (!blockedScreenData) blockedScreenData = {}
  
  blockedScreenData[tabId] = [hostname, favIconUrl]
  await chrome.storage.local.set({blockedScreenData})

  chrome.tabs.update(tabId, {
    url: chrome.runtime.getURL(`/src/pages/blocked-screen/blocked-screen.html`) 
  })
  
})