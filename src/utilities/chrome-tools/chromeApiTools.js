
import { getLocalNoOfVisitsTracker } from "../../localStorage/localNoOfVisitsTracker"
import { getLocalScreenTimeLimitByHostname } from "../../localStorage/localScreenTimeLimit"
import { getDateString } from "../date"

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


export const getRecnetSitesFromNoOfVisitsTracker = async (n)=>{
    // *Defaults for last 3 days
    if (n > 0) return []
    if (n === undefined) n = -2
    const recentSites = []
    // *takeing recent sites from noOfVisitsTracker for last 3 days
    let {noOfVisitsTracker} = await getLocalNoOfVisitsTracker()

    for (let i=n; i<=0; i++){
        const date = getDateString(i)
        if (!noOfVisitsTracker[date]) continue;
        for (const hostname in noOfVisitsTracker[date]){
            if(!recentSites.includes(hostname)){
                recentSites.push(hostname)
            }
        }
    }
    
    return recentSites
}