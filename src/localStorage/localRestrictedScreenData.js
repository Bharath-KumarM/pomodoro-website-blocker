// *restrictedScreenData

import { forceRestrictedScreenByTabId } from "../utilities/chrome-tools/forceTabs"

export const getLocalRestrictedScreenData = async ()=>{
    return await chrome.storage.local.get('restrictedScreenData')
}
export const getLocalRestrictedScreenDataByTabId = async (tabId)=>{
    const {restrictedScreenData} = await getLocalRestrictedScreenData()
    return restrictedScreenData[tabId] ?? null
}

export const setLocalRestrictedScreenData = async (restrictedScreenData)=>{
    return await chrome.storage.local.set({restrictedScreenData})
}
export const updateLocalRestrictedScreenDataByTab = async (tabId, [hostname, favIconUrl, url])=>{
    // Set/Update
    const {restrictedScreenData} = await getLocalRestrictedScreenData()
    restrictedScreenData[tabId] =  [hostname, favIconUrl, url]

    await setLocalRestrictedScreenData(restrictedScreenData)
    
    forceRestrictedScreenByTabId(tabId)

    return true;
}
export const delLocalRestrictedScreenDataByTabId = async (tabId)=>{
    let isValidDelete = false;

    const {restrictedScreenData} = await getLocalRestrictedScreenData();
    
    // Delete
    if (restrictedScreenData[tabId]) isValidDelete = true;

    delete restrictedScreenData[tabId];
    await setLocalRestrictedScreenData(restrictedScreenData);

    return isValidDelete;
}

export const checkLocalRestrictedScreenDataByTabId = async (tabId)=>{
    const {restrictedScreenData} = await chrome.storage.local.get('restrictedScreenData')
    return Boolean(restrictedScreenData[tabId])
}