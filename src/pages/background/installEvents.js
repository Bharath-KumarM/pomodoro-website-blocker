import { initializeLocalBlockedScreenData } from "../../localStorage/localBlockedScreenData"
import { initializeLocalBlockedSites } from "../../localStorage/localBlockedSites"
import { initializeLocalFocusModeTracker } from "../../localStorage/localFocusModeTracker"
import { initializeLocalRestrictedScreenData } from "../../localStorage/localRestrictedScreenData"
import { initializLocalRestrictedSites } from "../../localStorage/localRestrictedSites"
import { initializeLocalScheduleData } from "../../localStorage/localScheduleData"
import { initializeLocalScreenTimeLimit } from "../../localStorage/localScreenTimeLimit"
import { initializeLocalScreenTimeTracker } from "../../localStorage/localScreenTimeTracker"
import { initializeLocalTakeABreakTrackerforRestrict } from "../../localStorage/localTakeABreakTrackerforRestrict"
import { initializeLocalTimeLimitScreenData } from "../../localStorage/localTimeLimitScreenData"
import { initializeLocalVisitTracker } from "../../localStorage/localVisitTracker"
import { initializeLocalVisitTabIdTracker } from "../../localStorage/localVisitTrackerTabId"

export async function handleOnInstallEvent (){
    localStorageInitialize()
  } 

export async function localStorageInitialize (){
        // *Initialize browser storage local 
    // BlockedSites
    initializeLocalBlockedScreenData()
    initializeLocalBlockedSites()
  
    // Focus Mode & Restricted Sites 
    initializeLocalFocusModeTracker()
    initializeLocalRestrictedScreenData()

    initializLocalRestrictedSites()
  
    // ScreenTime and Visits
    initializeLocalScreenTimeLimit()
    initializeLocalScreenTimeTracker()
    initializeLocalTimeLimitScreenData()
    initializeLocalVisitTracker()
    initializeLocalVisitTabIdTracker()
  
    // Schedule & takeAbreakforRestrict
    initializeLocalScheduleData()
    initializeLocalTakeABreakTrackerforRestrict()
  
    // Miscelleneous
    const {BGtimeLog} = await chrome.storage.local.get('BGtimeLog')
    if (BGtimeLog === undefined){
      await chrome.storage.local.set({BGtimeLog: []})
    }
    const {logMassage} = await chrome.storage.local.get('logMassage')
    if (logMassage === undefined){
      await chrome.storage.local.set({logMassage: []})
    }
}