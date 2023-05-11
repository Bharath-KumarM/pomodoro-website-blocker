import { getDateString, getDayNumber } from "./date"
import { localLogMessage } from "./localStorage"

export async function getCurrTab(){
    let queryOptions = { active: true, lastFocusedWindow: true }
    
    let [currTab] = await chrome.tabs.query(queryOptions)
    return currTab
}

export async function blockOrUnblockSite(shouldBlock, hostname, favIconUrl){

    let {blockedSites} = await chrome.storage.local.get('blockedSites')
    if (!blockedSites) blockedSites = {}

    let refreshUrlPattern 
    if (shouldBlock && !blockedSites[hostname]){
        blockedSites[hostname] =  [favIconUrl]
        refreshUrlPattern = `*://${hostname}/*`

    } 
    else if (!shouldBlock && blockedSites[hostname] ){
        delete blockedSites[hostname]
        refreshUrlPattern = `chrome-extension://*/src/pages/blocked-screen/blocked-screen.html`;
    }
    else{
        // *ERROR!!!
        localLogMessage(`@chromeApiTools, @blockOrUnblockSite, shouldBlock: ${shouldBlock}, hostname: ${hostname}, favIconUrl: ${favIconUrl}` )
        return false
    }

    await chrome.storage.local.set({blockedSites})

    // *Refresh tabs based on affected URL
    const tabs = await chrome.tabs.query({url: refreshUrlPattern })
    for (const tab of tabs){
      chrome.tabs.reload(tab.id)
    }

    return true
}

export async function addOrRemoveRestrictSite(shouldRestrict, hostname, favIconUrl){

    if (!favIconUrl) favIconUrl = null

    let {restrictedSites} = await chrome.storage.local.get('restrictedSites')
    if (!restrictedSites) restrictedSites = {}

    const {focusModeTracker} = await chrome.storage.local.get('focusModeTracker')
    const isFocusModeOn = focusModeTracker ? true : false

    let refreshUrlPattern
    if (shouldRestrict){
        if (restrictedSites[hostname] ) return false; // already added
        restrictedSites[hostname] =  [favIconUrl]
        refreshUrlPattern = `*://${hostname}/*` 
    } else {
        delete restrictedSites[hostname]
        refreshUrlPattern = `chrome-extension://*/src/pages/restricted-screen/restricted-screen.html`
    }

    if (isFocusModeOn){
        // *Refresh restricted site tabs
        const tabs = await chrome.tabs.query({url: refreshUrlPattern})
        for (const tab of tabs){
          chrome.tabs.reload(tab.id)
        }
    }
    await chrome.storage.local.set({restrictedSites})
    return true
}



  export async function deleteTimeBtwFocusScheduleArr(deleteScheduleArr){
    const {scheduleData} = await chrome.storage.local.get('scheduleData')

    const newScheduleData = scheduleData.filter((schedule, index)=>!deleteScheduleArr.includes(index))
    await chrome.storage.local.set({scheduleData: newScheduleData})

    return true;

  }

export async function refreshAllTabsByHostname(hostname){
    
    // * Refresh the tabs based on hostname
    const tabs = await chrome.tabs.query({url: `*://${hostname}/*` })
    for (const {id} of tabs){
        chrome.tabs.reload(id)
        }
}
export async function refreshAllTimeLimitTabs(){
    const timeLimitUrl = 'src/pages/time-limit-screen/time-limit-screen.html'
    const tabs = await chrome.tabs.query({url: 'chrome-extension://*/' + timeLimitUrl }) 
    for (const {id} of tabs){
      chrome.tabs.reload(id)
    }
}
export async function getIsScreenTimeSurpassedLimit(hostname){
    let {screenTimeLimit} = await chrome.storage.local.get('screenTimeLimit')
    if (!screenTimeLimit[hostname]) return false;

    const [hours, minutes] = screenTimeLimit[hostname]
    const totalScreenTimeLimitInMinutes = (hours*60) + (minutes)

    let {screenTimeTracker} = await chrome.storage.local.get('screenTimeTracker')
    const dateString = getDateString(0) //Current day's date

    if (!screenTimeTracker || !screenTimeTracker[dateString] || !screenTimeTracker[dateString][hostname]){
        return false
    }
    const totalScreenTimeTrackerInMinutes = Math.round(screenTimeTracker[dateString][hostname])

    console.log({totalScreenTimeLimitInMinutes, totalScreenTimeTrackerInMinutes })
    return totalScreenTimeLimitInMinutes < totalScreenTimeTrackerInMinutes
}


export const getRecnetSitesFromNoOfVisitsTracker = async (n)=>{
    // *Defaults for last 3 days
    if (n > 0) return []
    if (n === undefined) n = -2
    const recentSites = []
    // *takeing recent sites from noOfVisitsTracker for last 3 days
    let {noOfVisitsTracker} = await chrome.storage.local.get('noOfVisitsTracker')

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