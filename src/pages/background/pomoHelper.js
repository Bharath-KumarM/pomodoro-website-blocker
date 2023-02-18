import {calculateReminingTime, getDateString, getCurrentTime} from './helper'


// Pomodoro Handle functions
export function handlePomoStart(pomoData){
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
  
export function handlePomoPause(pomoData){
    chrome.runtime.sendMessage({pomoData})
    chrome.storage.local.set({pomoData})
  }
  
  
export function handlePomoStop(pomoData){
    chrome.runtime.sendMessage({pomoData})
    chrome.storage.local.remove('pomoData')
  }
  
export function handlePomoReset(pomoData){
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
  
export function pushNotification({cycleName}){
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
  
export  function updatePomoHistory({cycleName, focusTime}){
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