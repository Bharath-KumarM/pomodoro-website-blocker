import { initializeLocalBlockedScreenData } from "../../localStorage/localBlockedScreenData"
import { initializeLocalFocusModeTracker } from "../../localStorage/localFocusModeTracker"
import { initializeLocalRestrictedScreenData } from "../../localStorage/localRestrictedScreenData"
import { initializeLocalScheduleData } from "../../localStorage/localScheduleData"
import { initializeLocalScreenTimeTracker } from "../../localStorage/localScreenTimeTracker"
import { initializLocalSettingsData } from "../../localStorage/localSettingsData"
import { initializingLocalSiteTagging } from "../../localStorage/localSiteTagging"
import { initializeLocalTakeABreakTrackerforRestrict } from "../../localStorage/localTakeABreakTrackerforRestrict"
import { initializeLocalTimeLimitScreenData } from "../../localStorage/localTimeLimitScreenData"
import { initializeLocalVisitTracker } from "../../localStorage/localVisitTracker"
import { initializeLocalVisitTabIdTracker } from "../../localStorage/localVisitTrackerTabId"

export async function handleOnInstallEvent (){
    localStorageInitialize()

    chrome.contextMenus.removeAll(()=>{
      chrome.contextMenus.create({
        documentUrlPatterns: ["https://*/*"],
        id: 'be-focused-block',
        type: 'normal',
        title: 'Block current site'
      })
    })
    

  } 

export async function localStorageInitialize (){
        // *Initialize browser storage local 
    // BlockedSites
    initializeLocalBlockedScreenData()
    initializingLocalSiteTagging()
  
    // Focus Mode & Restricted Sites 
    initializeLocalFocusModeTracker()
    initializeLocalRestrictedScreenData()

    // initializLocalRestrictedSites()
  
    // ScreenTime and Visits
    initializeLocalScreenTimeTracker()
    initializeLocalTimeLimitScreenData()
    initializeLocalVisitTracker()
    initializeLocalVisitTabIdTracker()
  
    // Schedule & takeAbreakforRestrict
    initializeLocalScheduleData()
    initializeLocalTakeABreakTrackerforRestrict()

    // Settings data
    initializLocalSettingsData()
  
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