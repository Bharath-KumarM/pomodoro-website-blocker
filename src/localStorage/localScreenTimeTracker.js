// *screenTimeTracker
export const getLocalScreenTimeTracker = async ()=>{
    return await chrome.storage.local.get('screenTimeTracker')
}

export const getLocalScreenTimeTrackerForDayByHostname = async (dateString, hostname)=>{
    const {screenTimeTracker} = await getLocalScreenTimeTracker()

    return Math.round(screenTimeTracker?.[dateString]?.[hostname] ?? 0);
}

export const setLocalScreenTimeTracker = async (screenTimeTracker)=>{
    return await chrome.storage.local.set({screenTimeTracker})
}