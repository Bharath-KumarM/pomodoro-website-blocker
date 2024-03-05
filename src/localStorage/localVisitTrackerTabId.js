import { getDateString } from "../utilities/date"

// *visitTabIdTracker

export const getLocalVisitTabIdTracker = async ()=>{
    return await chrome.storage.local.get('visitTabIdTracker') || {visitTabIdTracker: {}}
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


