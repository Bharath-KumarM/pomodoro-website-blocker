import { getIsScreenTimeSurpassedLimit } from "../utilities/chrome-tools/chromeApiTools"
import { refreshAllTabsByHostname, refreshAllTimeLimitScreenTabs } from "../utilities/chrome-tools/refreshTabs"

// *screenTimeLimit
export const getLocalScreenTimeLimit = async ()=>{
    return await chrome.storage.local.get('screenTimeLimit')
}
export const getLocalScreenTimeLimitByHostname = async (hostname)=>{
    const {screenTimeLimit} = await getLocalScreenTimeLimit()
    return screenTimeLimit[hostname] ?? null
}

export const setLocalScreenTimeLimit = async (screenTimeLimit)=>{
    return await chrome.storage.local.set({screenTimeLimit})
}
export const updateLocalScreenTimeLimit = async (hostname, timeLimit)=>{
    const {screenTimeLimit} = await getLocalScreenTimeLimit()

    // Updated
    screenTimeLimit[hostname] =  timeLimit
    await setLocalScreenTimeLimit(screenTimeLimit)

    const isScreenTimeSurpassedLimit = await getIsScreenTimeSurpassedLimit(hostname)
    if (isScreenTimeSurpassedLimit){
        refreshAllTabsByHostname(hostname)
    }
    
    return true; 
}
export const delLocalScreenTimeLimit = async (hostname)=>{

    const {screenTimeLimit} = await getLocalScreenTimeLimit()

    // Never Blocked
    if (!screenTimeLimit[hostname]){
        return false
    }

    // delete
    delete screenTimeLimit[hostname]
    await setLocalScreenTimeLimit(screenTimeLimit)

    // Refresh tabs 
    refreshAllTimeLimitScreenTabs()
    
    return true; 
}

export const checkLocalScreenTimeLimitByHostname = async (hostname)=>{
    const {screenTimeLimit} = await getLocalScreenTimeLimit()
    return Boolean(screenTimeLimit[hostname])
}
