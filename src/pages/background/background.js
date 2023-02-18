import {
  handlePomoStart, handlePomoPause, handlePomoStop, 
  handlePomoReset, pushNotification, updatePomoHistory
} from './pomoHelper'
import {handleUnblockSite, handleNewBlockSite} from './blockSiteHelper'

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

  else if(blockSitesData){
    let isDone
    if (msg === 'newBlockSite') {
      // todo: make this responsive
      sendResponse({responseIsBlocked: true})

      isDone = await handleNewBlockSite(blockSitesData)

      if (!isDone) return 
      chrome.tabs.query({url: `*://${blockSitesData['hostName']}/*` }, function(tabs){
        for (const tab of tabs){
          chrome.tabs.sendMessage(tab.id, {msg: 'block'})
        }
      })
    }
    else if (msg === 'unBlockSite'){
      // todo: make this responsive
      sendResponse({responseIsBlocked: false})

      isDone = await handleUnblockSite(blockSitesData)
      if (!isDone) return

      chrome.tabs.query({url: `*://${blockSitesData['hostName']}/*` }, function(tabs){
        for (const tab of tabs){
          chrome.tabs.sendMessage(tab.id, {msg: 'unblock'})
        }
      })
    }
  }


});

// chrome.tabs.onUpdated.addListener((tabId, {url}, tab)=>{

//   if (!url || !url.startsWith('http')) return

//   const hostname = new URL(location).hostname;
//   let isHostFound = false
//   for (const [blockedHostname, blockedFavIconUrl] of blockedSites){
//     if (blockedHostname === hostname) {
//       isHostFound = true
//       break
//     }
//   }
//   if (isHostFound){
//     chrome.scripting.executeScript(
//       {

//       }
//     )
//   }
// })