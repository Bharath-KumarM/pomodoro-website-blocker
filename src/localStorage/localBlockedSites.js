import { refreshAllBlockedScreenTabs, refreshAllTabsByHostname } from "../utilities/chrome-tools/refreshTabs"

// *blockedSites

export const initializeLocalBlockedSites = async ()=>{
    const {blockedSites} = await chrome.storage.local.get('blockedSites')
    if (blockedSites === undefined){
      await chrome.storage.local.set({blockedSites: {}})
    }
}
export const getLocalBlockedSites = async ()=>{
    return await chrome.storage.local.get('blockedSites')
}
export const getLocalBlockedSitesByHostname = async (hostname)=>{
    const {blockedSites} = await getLocalBlockedSites()
    return blockedSites[hostname] ?? null
}

export const setLocalBlockedSites = async (blockedSites)=>{
    return await chrome.storage.local.set({blockedSites})
}
export const updateLocalBlockedSites = async (hostname, favIconUrl=null)=>{
    const {blockedSites} = await getLocalBlockedSites()

    // Already blocked
    if (blockedSites[hostname]){
        return false
    }
    // Updated
    blockedSites[hostname] =  [favIconUrl]
    await setLocalBlockedSites(blockedSites)

    // Refresh tabs 
    refreshAllTabsByHostname(hostname)
    
    return true; 
}
export const delLocalBlockedSites = async (hostname)=>{

    const {blockedSites} = await getLocalBlockedSites()

    // Never Blocked
    if (!blockedSites[hostname]){
        return false
    }

    // delete
    delete blockedSites[hostname]
    await setLocalBlockedSites(blockedSites)

    // Refresh tabs 
    refreshAllBlockedScreenTabs()
    
    return true; 
}

export const checkLocalBlockedSitesByHostname = async (hostname)=>{
    const {blockedSites} = await getLocalBlockedSites()
    return Boolean(blockedSites[hostname])
}
