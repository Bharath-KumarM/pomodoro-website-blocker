import { checkLocalRestrictedSitesByHostname } from "../../localStorage/localRestrictedSites"
import { getLocalScreenTimeTrackerForDayByHostname } from "../../localStorage/localScreenTimeTracker"
import { getLocalTakeABreakTrackerforRestrict } from "../../localStorage/localTakeABreakTrackerforRestrict"

// Generic Helper functions
export function calculateReminingTime(pomoData){
    const { 
      focusTime, sortBreakTime, longBreakTime,
      cycleNumber, cycleName,
      mode, currCycle, 
      startTime, timeSpent,
      isPaused 
    } = pomoData
  
    const [focusTimeInSec, sortBreakTimeInSec, longBreakTimeInsec] = [focusTime*60, sortBreakTime*60, longBreakTime*60]
    const currTime = Date.now() / 1000
      
    // Calculate Reminding Time for the cycle
    let totalTime
    if (cycleName === 'focus') totalTime = focusTimeInSec
    if (cycleName === 'short') totalTime = sortBreakTimeInSec
    if (cycleName === 'long') totalTime = longBreakTimeInsec
    let actualTimePassed = isPaused ? timeSpent : currTime - startTime + timeSpent
    const remainingTime = totalTime - actualTimePassed
    
    return remainingTime
  }
  
export function getDateString (n){ 
    if (!n) n=0
    const askedDate = new Date(Date.now() + (n*864e5)); // 864e5 == 86400000 == 24*60*60*1000
    const year = askedDate.toLocaleString("default", { year: "numeric" });
    const month = askedDate.toLocaleString("default", { month: "2-digit" });
    const day = askedDate.toLocaleString("default", { day: "2-digit" });
  
    return `${day}-${month}-${year}`
  }
  
export function getCurrentTime () {
    const currDate = new Date()
    const hour = currDate.toLocaleString("default", { hour: "2-digit" }).split(" ")[0];
    const noon = currDate.toLocaleString("default", { hour: "2-digit" }).split(" ")[1];
    const minute = currDate.toLocaleString("default", { minute: "2-digit" });
  
    return `${noon}:${hour}:${minute}`
  }

export function createScreentimeTextForBadge(timeInMinutes){
    if (timeInMinutes === 0 ) return '';
    if (timeInMinutes < 1) return '<1m';
    if (timeInMinutes < 60) return `${timeInMinutes}m`;
  
    const hr = parseInt(timeInMinutes/60)
    const min = timeInMinutes - (hr*60) 
  
    if (min < 30 ) return `>${hr}h`
    else return `<${hr+1}h`
}

export async function handleUpdateBadgeIcon({tabId, hostname}){

  // Get screen time 
  const dateString = getDateString(0)
  const screenTimeInMinutes = await getLocalScreenTimeTrackerForDayByHostname(dateString, hostname)

  const badgeText = createScreentimeTextForBadge(screenTimeInMinutes)
  chrome.action.setBadgeBackgroundColor({tabId, color: [159, 255, 239, 255] });
  chrome.action.setBadgeText({tabId, text: badgeText})

  const isRestrictedSite = await checkLocalRestrictedSitesByHostname(hostname)
  const takeABreakTimeLeft = await getTakeABreakTrackerforRestrictData()
  if (takeABreakTimeLeft && isRestrictedSite){

    const badgeText = `+${createScreentimeTextForBadge(takeABreakTimeLeft)}`

    chrome.action.setBadgeBackgroundColor({tabId, color: [61, 255, 139, 255] });
    chrome.action.setBadgeText({tabId, text: badgeText})

  }

  return true;
  
}

const getTakeABreakTrackerforRestrictData = async ()=>{
  // Take a break
  const {takeABreakTrackerforRestrict} = await getLocalTakeABreakTrackerforRestrict()

  if (takeABreakTrackerforRestrict !== undefined){
      if (takeABreakTrackerforRestrict === false) {
        return false
      }
      else{
          const newTimeDiff = Math.ceil((takeABreakTrackerforRestrict - new Date().getTime())/(1000*60))
          return newTimeDiff
      }
  } 
}