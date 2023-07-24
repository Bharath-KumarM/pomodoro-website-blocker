
import { getLocalScreenTimeLimitByHostname } from "../../localStorage/localScreenTimeLimit"
import { getLocalScreenTimeTracker, getLocalScreenTimeTrackerForDay } from "../../localStorage/localScreenTimeTracker"
import { getDateString } from "../date"

export async function getCurrTab(){
    let queryOptions = { active: true, lastFocusedWindow: true }
    
    let [currTab] = await chrome.tabs.query(queryOptions)
    return currTab
}


export async function checkScreenTimeSurpassedLimit(hostname){    
    const timeLmitOfSite = await getLocalScreenTimeLimitByHostname(hostname)
    if (!timeLmitOfSite) return false;

    const [hours, minutes] = timeLmitOfSite
    const totalScreenTimeLimitInMinutes = (hours*60) + (minutes)

    let {screenTimeTracker} = await chrome.storage.local.get('screenTimeTracker')
    const dateString = getDateString(0) //Current day's date

    if (!screenTimeTracker || !screenTimeTracker[dateString] || !screenTimeTracker[dateString][hostname]){
        return false
    }
    const totalScreenTimeTrackerInMinutes = Math.round(screenTimeTracker[dateString][hostname])

    return totalScreenTimeLimitInMinutes < totalScreenTimeTrackerInMinutes
}

export const getRecentHostnames = async (n=-3)=>{
    /* todo: since visit tracker is recenly created, it may not have a lot of sites. So, for time being 
       getLocalScreenTimeTrackerForDay used.
    */

    // const tracker = await getLocalVisitTracker()
    const {screenTimeTracker: tracker} = await getLocalScreenTimeTracker()
    
    let trackerForNDays = {}
    for ( let i=n; i<=0; i++ ){
        const trackerForDay = tracker[ getDateString(i) ] ?? {}
        trackerForNDays = { ...trackerForNDays, ...trackerForDay }
    }

    return Object.keys(trackerForNDays)
}