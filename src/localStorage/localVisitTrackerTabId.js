import { getDateString } from "../utilities/date"

// *visitTabIdTracker
export const initializeLocalVisitTabIdTracker = async ()=>{
    const {visitTabIdTracker} = await chrome.storage.local.get('visitTabIdTracker')
    if (visitTabIdTracker === undefined){
      await chrome.storage.local.set({visitTabIdTracker: {}})
    }
}
export const getLocalVisitTabIdTracker = async ()=>{
    return await chrome.storage.local.get('visitTabIdTracker')
}

export const setLocalVisitTabIdTracker = async (visitTabIdTracker)=>{
    return await chrome.storage.local.set({visitTabIdTracker})
}

export const checkLocalVisitTabIdTrackerNewSession = async (tabId, hostname) =>{
    const{visitTabIdTracker} = await getLocalVisitTabIdTracker()
    if (visitTabIdTracker[tabId] === hostname){
        return false
    }

    visitTabIdTracker[tabId] = hostname
    setLocalVisitTabIdTracker(visitTabIdTracker)

    return true
}
export const delLocalVisitTabIdTracker = async (tabId)=>{
    const {visitTabIdTracker} = await getLocalVisitTabIdTracker()

    if (visitTabIdTracker[tabId]){

        delete visitTabIdTracker[tabId]
        await setLocalVisitTabIdTracker(visitTabIdTracker)

        return true
    }

    return false
}


