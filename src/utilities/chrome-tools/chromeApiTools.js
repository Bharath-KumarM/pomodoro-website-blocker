
import { getLocalScreenTimeLimitByHostname } from "../../localStorage/localScreenTimeLimit"
import { getDateString } from "../date"
import { getNoOfVisitsObjByDateRage } from "../noOfVisits"

export async function getCurrTab(){
    let queryOptions = { active: true, lastFocusedWindow: true }
    
    let [currTab] = await chrome.tabs.query(queryOptions)
    return currTab
}


export async function getIsScreenTimeSurpassedLimit(hostname){    
    const timeLmitOfSite = await getLocalScreenTimeLimitByHostname()
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
    const noOfVisitsObj = await getNoOfVisitsObjByDateRage( getDateString(n) )
    return Object.keys(noOfVisitsObj)
}