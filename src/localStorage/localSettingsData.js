import { getAllTabs } from "../utilities/chrome-tools/chromeApiTools"
import { refreshAllTabsByHostname } from "../utilities/chrome-tools/refreshTabs"
import { updateContentScripts } from "../utilities/contentScript"

export const initializLocalSettingsData = async ()=>{
    const {settingsData} = await chrome.storage.local.get('settingsData')

    // Runs only once
    if (settingsData === undefined){
      resetLocalSettingsData()
    }
}

export async function getLocalSettingsData({key=null}){
    const {settingsData} = await chrome.storage.local.get('settingsData')

    if (key === null){
      return settingsData
    }

    return settingsData[key]
}

export async function setLocalSettingsData(settingsData){
    await chrome.storage.local.set({settingsData})
    return settingsData
}

export async function resetLocalSettingsData(){
  const settingsData = {
    'should-show-notification': true,
    'should-count-screen-time-bg-audio': true
  }
  await chrome.storage.local.set({settingsData})

  return settingsData
}


export async function updateLocalSettingsData({
  key=null,
  data=null,
  optionalData=null
}){


  if (key === null || data === null){
    return false
  }

  const settingsData = await getLocalSettingsData({})
  const oldData = settingsData[key] 
  settingsData[key] = data
  await setLocalSettingsData(settingsData)


  if (key === 'ignore-sites'){
    // handle ignore-sites update
    await refreshAllTabsByHostname(optionalData)
    await updateContentScripts()

  }

  
  if (key === 'should-show-notification'){
    
  }

  if (key === 'access-webpage'){

  }

  if (key === 'should-count-screen-time-bg-audio'){

    const tabs = await getAllTabs()

    for (const tab of tabs){
      const {id: tabId} = tab
      const audible = data ? 'check' : false
      try {
        const response = await chrome.tabs.sendMessage(tabId, {audibleInfo: {audible}});
      } catch {

      }
    }
    
  }
  return settingsData

}
