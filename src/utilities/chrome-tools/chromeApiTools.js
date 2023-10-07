
import { getLocalScreenTimeLimitByHostname } from "../../localStorage/localScreenTimeLimit"
import { getLocalVisitTracker } from "../../localStorage/localVisitTracker"
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

export const getRecentHostnames = async (n=-30)=>{
    const {visitTracker: tracker} = await getLocalVisitTracker()

    let hostnames = []
    for ( let i=n; i<=0; i++ ){
        const trackerForDay = tracker[ getDateString(i) ] ?? {}
        hostnames.push(...Object.keys(trackerForDay))
    }

    hostnames.reverse()
    const uniqueHostnames = [...new Set(hostnames)]

    return uniqueHostnames
}