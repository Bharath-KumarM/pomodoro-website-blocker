import { setLocalBlockedScreenData } from "../../localStorage/localBlockedScreenData"
import { setLocalRestrictedScreenData } from "../../localStorage/localRestrictedScreenData"
import { cleanLocalScreenTimeTracker } from "../../localStorage/localScreenTimeTracker"
import { setLocalTimeLimitScreenData } from "../../localStorage/localTimeLimitScreenData"
import { cleanLocalVisitTracker } from "../../localStorage/localVisitTracker"
import { setLocalVisitTabIdTracker } from "../../localStorage/localVisitTrackerTabId"
import { registerContentScripts, updateContentScripts } from "../../utilities/contentScript"

export async function handleOnStartUp(){

    // remove extention screen data
    setLocalBlockedScreenData({})
    setLocalRestrictedScreenData({})
    setLocalTimeLimitScreenData({})
    setLocalVisitTabIdTracker({})

    // Clean data older 30 days
    cleanLocalScreenTimeTracker()
    cleanLocalVisitTracker()

    console.log(`OnStartUp`, Date ().toLocaleString())
}