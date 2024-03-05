import { getRestrictedSites } from "../../localStorage/localSiteTagging"
import { turnOffLocalTakeABreakTrackerforRestrict } from "../../localStorage/localTakeABreakTrackerforRestrict"

export async function handleOnAlarm({name}){
    // name = 'takeABreakForRestrict' ||'takeABreakForRestrictBefore2minute' || 'takeABreakForRestrictBefore1minute'
  
    // Take A Break alarm ends for restricting sites
    if (name.startsWith('takeABreakForRestrict')){
      if (name === 'takeABreakForRestrict'){
        turnOffLocalTakeABreakTrackerforRestrict({isForceTurnOff: false, shouldRefreshSites: true})
        return null
      }
      
    let restrictedSites = await getRestrictedSites()

    let takeABreakForRestrictRemainingMinutes
    if (name === 'takeABreakForRestrictBefore2minute'){
        takeABreakForRestrictRemainingMinutes = 2
    }
    else if (name === 'takeABreakForRestrictBefore1minute'){
        takeABreakForRestrictRemainingMinutes = 1
    }
    if (!takeABreakForRestrictRemainingMinutes){
        return null
    }

    for (const hostname of restrictedSites){
        const tabs = await chrome.tabs.query({url: `*://${hostname}/*` })
        for (const {id} of tabs){
        const response = await chrome.tabs.sendMessage(id, {takeABreakForRestrictRemainingMinutes})
        }
    }
    }
  }