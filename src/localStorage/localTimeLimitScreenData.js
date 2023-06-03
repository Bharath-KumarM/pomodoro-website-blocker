import { forceTimeLimitScreenByTabId } from "../utilities/chrome-tools/forceTabs"

// *timeLimitScreenData
export const getLocalTimeLimitScreenData = async ()=>{
    return await chrome.storage.local.get('timeLimitScreenData')
}
export const getLocalTimeLimitScreenDataByTabId = async (tabId)=>{
    const {timeLimitScreenData} = await getLocalTimeLimitScreenData()
    return timeLimitScreenData[tabId] ?? null
}

export const setLocalTimeLimitScreenData = async (timeLimitScreenData)=>{
    return await chrome.storage.local.set({timeLimitScreenData})
}
export const updateLocalTimeLimitScreenDataByTab = async (tabId, [hostname, favIconUrl, url])=>{
    // Set/Update
    const {timeLimitScreenData} = await getLocalTimeLimitScreenData()
    timeLimitScreenData[tabId] =  [hostname, favIconUrl, url]

    await setLocalTimeLimitScreenData(timeLimitScreenData)
    
    forceTimeLimitScreenByTabId(tabId)
    
    return true; 
}
export const delLocalTimeLimitScreenDataByTabId = async (tabId)=>{
    let isValidDelete = false;

    const {timeLimitScreenData} = await getLocalTimeLimitScreenData();
    
    // Delete
    if (timeLimitScreenData[tabId]) isValidDelete = true;

    delete timeLimitScreenData[tabId];
    await setLocalTimeLimitScreenData(timeLimitScreenData);

    return isValidDelete;
}

export const checkLocalTimeLimitScreenDataByTabId = async (tabId)=>{
    const {timeLimitScreenData} = await chrome.storage.local.get('timeLimitScreenData')
    return Boolean(timeLimitScreenData[tabId])
}
