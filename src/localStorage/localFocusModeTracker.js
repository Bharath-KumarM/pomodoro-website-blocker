import { refreshAllRestrictedScreenTabs, refreshAllRestrictedSites } from "../utilities/chrome-tools/refreshTabs"


export const getLocalFocusModeTracker = async ()=>{
    return await chrome.storage.local.get('focusModeTracker')
}

export async function turnOnLocalFocusModeTracker(){
    chrome.storage.local.set({focusModeTracker: true})
    await refreshAllRestrictedSites()
    return true
  }
  export async function turnOffLocalFocusModeTracker(){
    chrome.storage.local.set({focusModeTracker: false})
    await refreshAllRestrictedScreenTabs()
    return true
  }
