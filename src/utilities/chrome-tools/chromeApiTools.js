
import { getLocalSettingsData } from "../../localStorage/localSettingsData"
import { getScreenTimeLimit } from "../../localStorage/localSiteTagging"
import { getLocalVisitTracker } from "../../localStorage/localVisitTracker"
import { getDateString } from "../date"

export async function getCurrTab(){
    let queryOptions = { active: true, lastFocusedWindow: true }
    
    let [currTab] = await chrome.tabs.query(queryOptions)
    return currTab
}

export async function getAllTabs(){
    return await chrome.tabs.query({})
}


export async function checkScreenTimeSurpassedLimit(hostname){    
    const timeLmitOfSite = await getScreenTimeLimit(hostname)
    if (!timeLmitOfSite) return false;

    const [hours, minutes] = timeLmitOfSite
    const totalScreenTimeLimitInMinutes = (hours*60) + (minutes)

    return totalScreenTimeLimitInMinutes
}

export async function getScreenTimeTrackerInMinutesByHostname(hostname){
    let {screenTimeTracker} = await chrome.storage.local.get('screenTimeTracker')
    const dateString = getDateString(0) //Current day's date

    if (!screenTimeTracker || !screenTimeTracker[dateString] || !screenTimeTracker[dateString][hostname]){
        return false
    }
    const totalScreenTimeTrackerInMinutes = Math.round(screenTimeTracker[dateString][hostname])

    return totalScreenTimeTrackerInMinutes
}

export async function getScreenTimeSurpassedPercentage(hostname){    
    const totalScreenTimeLimitInMinutes = await getScreenTimeLimitInMinutesByHostnme(hostname)
    const totalScreenTimeTrackerInMinutes = await getScreenTimeTrackerInMinutesByHostname(hostname)

    if ([totalScreenTimeLimitInMinutes, totalScreenTimeTrackerInMinutes].includes(false)){
        return false
    }

    return Math.round((totalScreenTimeTrackerInMinutes / totalScreenTimeLimitInMinutes) * 100 )
}
export async function checkScreenTimeSurpassedLimit(hostname){    
    const totalScreenTimeLimitInMinutes = await getScreenTimeLimitInMinutesByHostnme(hostname)
    const totalScreenTimeTrackerInMinutes = await getScreenTimeTrackerInMinutesByHostname(hostname)

    if ([totalScreenTimeLimitInMinutes, totalScreenTimeTrackerInMinutes].includes(false)){
        return false
    }

    return totalScreenTimeLimitInMinutes < totalScreenTimeTrackerInMinutes
}

export const getRecentHostnames = async (n=-30)=>{
    const tracker = await getLocalVisitTracker()
    // const ignoreSites = await getLocalSettingsData({key: 'ignore-sites'})

    let hostnames = []
    for ( let i=n; i<=0; i++ ){
        const trackerForDay = tracker[ getDateString(i) ] ?? {}
        hostnames.push(...Object.keys(trackerForDay))
    }

    hostnames.reverse()
    return [...new Set(hostnames)]
    // const uniqueHostnames = [...new Set(hostnames)].filter(hostname=> !ignoreSites.includes(hostname))

    // return uniqueHostnames
}