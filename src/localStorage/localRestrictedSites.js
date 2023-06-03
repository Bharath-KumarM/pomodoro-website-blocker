import { refreshAllRestrictedScreenTabs, refreshAllTabsByHostname } from "../utilities/chrome-tools/refreshTabs"
import { getLocalFocusModeTracker } from "./localFocusModeTracker"

// *restrictedSites
export const getLocalRestrictedSites = async ()=>{
    return await chrome.storage.local.get('restrictedSites')
}
export const getLocalRestrictedSitesByHostname = async (hostname)=>{
    const {restrictedSites} = await getLocalRestrictedSites()
    return restrictedSites[hostname] ?? null
}

export const setLocalRestrictedSites = async (restrictedSites)=>{
    return await chrome.storage.local.set({restrictedSites})
}
export const updateLocalRestrictedSites = async (hostname, favIconUrl=null)=>{
    const {restrictedSites} = await getLocalRestrictedSites()

    // Already blocked
    if (restrictedSites[hostname]){
        return false
    }
    // Updated
    restrictedSites[hostname] =  [favIconUrl]
    await setLocalRestrictedSites(restrictedSites)

    
    const {focusModeTracker} = await getLocalFocusModeTracker()
    const isFocusModeOn = focusModeTracker ? true : false

    if (!isFocusModeOn){
        return true;
    }

    // Refresh tabs 
    refreshAllTabsByHostname(hostname)
    
    return true; 
}
export const delLocalRestrictedSites = async (hostname)=>{

    const {restrictedSites} = await getLocalRestrictedSites()

    // Never Blocked
    if (!restrictedSites[hostname]){
        return false
    }

    // delete
    delete restrictedSites[hostname]
    await setLocalRestrictedSites(restrictedSites)

    const {focusModeTracker} = await getLocalFocusModeTracker()
    const isFocusModeOn = focusModeTracker ? true : false

    if (!isFocusModeOn){
        return true
    }
 
    refreshAllRestrictedScreenTabs()
    
    return true; 
}

export const checkLocalRestrictedSitesByHostname = async (hostname)=>{
    const {restrictedSites} = await getLocalRestrictedSites()
    return Boolean(restrictedSites[hostname])
}
