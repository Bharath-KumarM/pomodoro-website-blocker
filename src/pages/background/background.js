import { handleOnInstall } from './onInstall'
import { handleOnStartUp } from './onStartup'
import { handleOnMessage } from './onMessage'
import { handleOnAlarm } from './onAlarm'
import { handleOnBeforeNavigate } from './onBeforeNavigate'
import { handleOnUpdated } from './onUpdated'
import { handleContextMenuOnClick } from './contextMenusClick'
import { handleOnRemoved } from './onRemoved'

console.log('Script running from background!!!')

chrome.action.setBadgeBackgroundColor({ color: [175, 227, 255, 255] });

// Runtime Log 
chrome.storage.local.get('BGtimeLog', ({BGtimeLog})=>{
  const MAX_LEN = 100

  const newBGtimeLog = BGtimeLog ? BGtimeLog.slice(-MAX_LEN) :[]
  console.log(newBGtimeLog)
  
  newBGtimeLog.push(new Date().toString().slice(0, 25))

  chrome.storage.local.set({BGtimeLog: newBGtimeLog})

})

//* On Install or Update event or reloaded the package
chrome.runtime.onInstalled.addListener(handleOnInstall)

// * Handles new session opened
chrome.runtime.onStartup.addListener(handleOnStartUp)

//* Handle messages from content script
chrome.runtime.onMessage.addListener(handleOnMessage)

//* Handles alarm
chrome.alarms.onAlarm.addListener(handleOnAlarm)

//* Handles URL updates
chrome.webNavigation.onBeforeNavigate.addListener(handleOnBeforeNavigate, 
  {url: [{urlPrefix: 'http'}]}
)
chrome.tabs.onUpdated.addListener(handleOnUpdated)

// *Handles Tab closes
chrome.tabs.onRemoved.addListener(handleOnRemoved)

// *Handles context menu click
chrome.contextMenus.onClicked.addListener(handleContextMenuOnClick)

// Debug only
// chrome.storage.onChanged.addListener((changes, namespace) => {
//   for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
//     console.log(
//       `Storage key "${key}" in namespace "${namespace}" changed.`,
//       `Old value was "${oldValue}", new value is "${newValue}".`
//     );
//   }
// });
