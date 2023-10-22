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
    return await chrome.storage.local.set(settingsData)
}