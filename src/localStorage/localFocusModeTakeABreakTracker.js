export const getLocalFocusModeTakeABreakTracker = async ()=>{
    return await chrome.storage.local.get('focusModeTakeABreakTracker')
}

export const setLocalFocusModeTakeABreakTracker = async (focusModeTakeABreakTracker)=>{
    return await chrome.storage.local.set({focusModeTakeABreakTracker})
}