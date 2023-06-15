import { cleanLocalNoOfVisitsTracker, delLocalNoOfVisitsTrackerByDate } from "../../localStorage/localNoOfVisitsTracker"
import { cleanLocalScreenTimeTracker } from "../../localStorage/localScreenTimeTracker"

export async function handleOnStartUpEvent(){

    // cleanup mechanism for tabid based loacal storage
    chrome.storage.local.set({blockedScreenData: {}})
    chrome.storage.local.set({restrictedScreenData: {}})
    chrome.storage.local.set({timeLimitScreenData: {}})

    // Clean data older 30 days
    cleanLocalNoOfVisitsTracker()
    cleanLocalScreenTimeTracker()
}