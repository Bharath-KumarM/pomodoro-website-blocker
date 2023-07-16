import { cleanLocalScreenTimeTracker } from "../../localStorage/localScreenTimeTracker"
import { cleanLocalVisitTracker } from "../../localStorage/localVisitTracker"
import {  } from "../../localStorage/localVisitTrackerTabId"

export async function handleOnStartUpEvent(){

    // cleanup mechanism for tabid based loacal storage
    // todo: create a seperate functions
    chrome.storage.local.set({blockedScreenData: {}})
    chrome.storage.local.set({restrictedScreenData: {}})
    chrome.storage.local.set({timeLimitScreenData: {}})
    chrome.storage.local.set({visitTabIdTracker: {}})

    // Clean data older 30 days
    cleanLocalScreenTimeTracker()
    cleanLocalVisitTracker()
}