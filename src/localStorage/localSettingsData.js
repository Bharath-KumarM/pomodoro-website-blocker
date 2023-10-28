

export const initializLocalSettingsData = async ()=>{
    const {settingsData} = await chrome.storage.local.get('settingsData')

    // Runs only once
    if (settingsData === undefined){
      await chrome.storage.local.set({settingsData: {
        'should-show-notification': true
      }})
    }
}

export async function getLocalSettingsData(){
    return await chrome.storage.local.get('settingsData')
}

export async function setLocalSettingsData(settingsData){
    return await chrome.storage.local.set({settingsData})
}

export const updateLocalSettingsData = {
  
  'should-show-notification': async (isAcitve)=>{

    if (!isAcitve){
      await chrome.runtime.sendMessage(
        {handleTurnOffLocalTakeABreakBefore: true}
      )
      // todo: should clear alarms set for time limit exceed as well
    }
    
    const {settingsData} = await getLocalSettingsData()    
    setLocalSettingsData({...settingsData, 'should-show-notification': isAcitve})
  },
  'access-webpage': async (isActive) => {
    const {settingsData} = await getLocalSettingsData()
    await setLocalSettingsData({...settingsData, 'access-webpage': isActive})
  },
  'ignore-sites': async (ignoreSitesArr) => {
    // todo: need to do some activities before ignoring any sites

    const {settingsData} = await getLocalSettingsData()
    await setLocalSettingsData({...settingsData, 'ignore-sites': ignoreSitesArr})
  }


}