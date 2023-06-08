import { forceBlockedScreenByTabId } from "../utilities/chrome-tools/forceTabs"

// *blockedScreenData

export const initializeLocalBlockedScreenData = async ()=>{
    const {blockedScreenData} = await chrome.storage.local.get('blockedScreenData')
    if (blockedScreenData === undefined){
      await chrome.storage.local.set({blockedScreenData: {}})
    }
}
export const getLocalBlockedScreenData = async ()=>{
    return await chrome.storage.local.get('blockedScreenData')
}
export const getLocalBlockedScreenDataByTabId = async (tabId)=>{
    const {blockedScreenData} = await getLocalBlockedScreenData()
    return blockedScreenData[tabId] ?? null
}

export const setLocalBlockedScreenData = async (blockedScreenData)=>{
    return await chrome.storage.local.set({blockedScreenData})
}
export const updateLocalBlockedScreenDataByTab = async (tabId, [hostname, favIconUrl, url])=>{
    // Set/Update
    const {blockedScreenData} = await getLocalBlockedScreenData()
    blockedScreenData[tabId] =  [hostname, favIconUrl, url]

    await setLocalBlockedScreenData(blockedScreenData);
    forceBlockedScreenByTabId(tabId)

    return true;
}
export const delLocalBlockedScreenDataByTabId = async (tabId)=>{
    let isValidDelete = false;

    const {blockedScreenData} = await getLocalBlockedScreenData();
    
    // Delete
    if (blockedScreenData[tabId]) isValidDelete = true;

    delete blockedScreenData[tabId];
    await setLocalBlockedScreenData(blockedScreenData);

    return isValidDelete;
}

export const checkLocalBlockedScreenDataByTabId = async (tabId)=>{
    const {blockedScreenData} = await chrome.storage.local.get('blockedScreenData')
    return Boolean(blockedScreenData[tabId])
}
