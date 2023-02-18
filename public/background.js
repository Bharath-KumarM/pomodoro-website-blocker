
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

// Block sites Handles funciton
async function handleUnblockSite({hostName, favIconUrl}){
  console.log(`Request for unblocking,  ${hostName}`)
  let {blockedSites} = await chrome.storage.local.get('blockedSites')
  if (!blockedSites) blockedSites = []

  let isHostRemoved = false
  const newBlockedSites = []
  for (const [blockedHostname, blockedFavIconUrl] of blockedSites){
    if (blockedHostname !== hostName) {
      newBlockedSites.push([blockedHostname, blockedFavIconUrl])
    }
    else isHostRemoved = true
  }
  if (isHostRemoved){
    await chrome.storage.local.set({blockedSites: [...newBlockedSites]})
  }
  return isHostRemoved
}

async function handleNewBlockSite({hostName, favIconUrl}){
  let {blockedSites} = await chrome.storage.local.get('blockedSites')
  if (!blockedSites) blockedSites = []

  let isHostFound = false
  for (const [blockedHostname, blockedFavIconUrl] of blockedSites){
    if (blockedHostname === hostName) {
      isHostFound = true
      break
    }
  }
  // Since Host is not found, add the new site to the list
  if (!isHostFound){
    blockedSites.push([hostName, favIconUrl])
    await chrome.storage.local.set({blockedSites: [...blockedSites]})
  }
  return !isHostFound
}

// Pomodoro Handle functions
function handlePomoStart(pomoData){
  const remainingTime = calculateReminingTime(pomoData)
  chrome.alarms.create(
    'pomodoro_alarm_id',
    {
      when: Date.now() + (remainingTime*1000),
    }
  )

  chrome.runtime.sendMessage({pomoData})
  chrome.storage.local.set({pomoData})
}

function handlePomoPause(pomoData){
  chrome.runtime.sendMessage({pomoData})
  chrome.storage.local.set({pomoData})
}


function handlePomoStop(pomoData){
  chrome.runtime.sendMessage({pomoData})
  chrome.storage.local.remove('pomoData')
}

function handlePomoReset(pomoData){
  const defaultPomoData = { 
    mode: 'setup', 
    focusTime: 1, 
    sortBreakTime: 1, 
    longBreakTime: 1, 
    cycleNumber: 4
  } 
  chrome.runtime.sendMessage({pomoData: {...defaultPomoData}})
  chrome.storage.local.remove('pomoData')
}

function pushNotification({cycleName}){
  const notificationTitle = 'Pomodoro Timmer'
  let notificationMsg
  let notificationBtnTitle
  if (cycleName === 'focus'){
    notificationMsg = 'Focus Time is over'
    notificationBtnTitle = 'Take a break'
  }
  else if (cycleName === 'short'){
    notificationMsg = 'Break Time is over'
    notificationBtnTitle = 'Start Focusing'
  }
  else if (cycleName === 'long'){
    notificationMsg = 'Hurray! Pomodoro Session Completed'
    notificationBtnTitle = 'Start New Session'
  }

  // Create Notification
  chrome.notifications.create('NOTFICATION_ID', {
    type: 'basic',
    iconUrl: '../icons/logo_1.png',
    title: notificationTitle,
    message: notificationMsg,
    priority: 2,
    buttons: [
        {
            title: notificationBtnTitle
        }
    ]
  })
}

function updatePomoHistory({cycleName, focusTime}){
  // Pomdoro history
  if (cycleName !== 'focus') return

  const dateString = getDateString(0)
  const timeString = getCurrentTime()

  // Update Pomodoro History
  chrome.storage.local.get('pomoHist', ({pomoHist})=>{
    if (!pomoHist) pomoHist = {}

    if (!pomoHist[dateString]) pomoHist[dateString] = []

    pomoHist[dateString].push([timeString, focusTime]) //[pomodoroCompletedTime, pomodoroDuration]
    
    chrome.storage.local.set({pomoHist: {...pomoHist}}, ()=>{
      console.log('pomodoro history updated!!!', pomoHist)
    })
  })
}



// Generic Helper functions - Later moved to seperate module
function calculateReminingTime(pomoData){
  const { 
    focusTime, sortBreakTime, longBreakTime,
    cycleNumber, cycleName,
    mode, currCycle, 
    startTime, timeSpent,
    isPaused 
  } = pomoData

  const [focusTimeInSec, sortBreakTimeInSec, longBreakTimeInsec] = [focusTime*60, sortBreakTime*60, longBreakTime*60]
  const currTime = Date.now() / 1000
    
  // Calculate Reminding Time for the cycle
  let totalTime
  if (cycleName === 'focus') totalTime = focusTimeInSec
  if (cycleName === 'short') totalTime = sortBreakTimeInSec
  if (cycleName === 'long') totalTime = longBreakTimeInsec
  let actualTimePassed = isPaused ? timeSpent : currTime - startTime + timeSpent
  const remainingTime = totalTime - actualTimePassed
  
  return remainingTime
}

function getDateString (n){ 
  if (!n) n=0
  const askedDate = new Date(Date.now() + (n*864e5)); // 864e5 == 86400000 == 24*60*60*1000
  const year = askedDate.toLocaleString("default", { year: "numeric" });
  const month = askedDate.toLocaleString("default", { month: "2-digit" });
  const day = askedDate.toLocaleString("default", { day: "2-digit" });

  return `${day}-${month}-${year}`
}

function getCurrentTime () {
  const currDate = new Date()
  const hour = currDate.toLocaleString("default", { hour: "2-digit" }).split(" ")[0];
  const noon = currDate.toLocaleString("default", { hour: "2-digit" }).split(" ")[1];
  const minute = currDate.toLocaleString("default", { minute: "2-digit" });

  return `${noon}:${hour}:${minute}`
}

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