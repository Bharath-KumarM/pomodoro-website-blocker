
console.log('Script running from background!!!')

// Hardcoded data
const defaultPomoData = { 
  mode: 'setup', 
  // focusTime: 25, 
  // sortBreakTime: 5, 
  // longBreakTime: 30, 
  // cycleNumber: 4
  focusTime: 1, 
  sortBreakTime: 1, 
  longBreakTime: 1, 
  cycleNumber: 4
}  

// Stores script run log 
chrome.storage.local.get('BGtimeLog', ({BGtimeLog})=>{
  if (!BGtimeLog) BGtimeLog = []
  BGtimeLog.push(new Date().toString().slice(0, 25))
  console.log(BGtimeLog)
  chrome.storage.local.set({BGtimeLog: BGtimeLog})

})



async function handleCycleDone (pomoData){

  const { 
    focusTime, sortBreakTime, longBreakTime,
    cycleNumber, cycleName,
    mode, currCycle, 
    startTime, timeSpent,
    isPaused 
  } = pomoData


  // -Add the completed pomodoro details

  // Send done message to content script
  await chrome.storage.local.set({pomoData: {
    ...pomoData, 
    mode: 'done'
  }})


  // Send notification to user

  // Open a tab
}

function updatePomoHistory({cycleName, focusTime}){
    // Pomdoro history
    if (cycleName === 'focus'){
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
}



let timer
// Message Listener
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse)=> {
  // Request Types
  const { pomoData, msg } = request

  // Pomodoro Data
  if (pomoData){
    if (msg === 'start'){
      const remainingTime = calculateReminingTime(pomoData)
      clearTimeout(timer)
      timer = setTimeout(()=>{
          // When time is up
          console.log('time is up')
          chrome.storage.local.set({pomoData: {
            ...pomoData, 
            mode: 'done'
          }}, ()=>{
            chrome.runtime.sendMessage({pomoData: {...pomoData, mode: 'done'}})
            updatePomoHistory(pomoData)
          })
        }, remainingTime*1000)

      chrome.runtime.sendMessage({pomoData})

      await chrome.storage.local.set({pomoData})

    }

    if (msg  === 'pause'){
      clearTimeout(timer)
      chrome.runtime.sendMessage({pomoData})

      await chrome.storage.local.set({pomoData})
    }

    if (msg === 'reset'){
      console.log('reset triggered')
      chrome.runtime.sendMessage({pomoData: {...defaultPomoData}})

      await chrome.storage.local.remove('pomoData')
    }
    if (msg === 'stop'){
      console.log('Stop Pomodoro')
      chrome.runtime.sendMessage({pomoData: {...pomoData}})
      await chrome.storage.local.remove('pomoData')
    }

  }


});


// Helper functions - Later moved to seperate file
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