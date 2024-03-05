import { delLocalBlockedScreenDataByTabId } from "../../localStorage/localBlockedScreenData"
import { delLocalRestrictedScreenDataByTabId } from "../../localStorage/localRestrictedScreenData"
import { delLocalTimeLimitScreenDataByTabId } from "../../localStorage/localTimeLimitScreenData"
import { delLocalVisitTabIdTracker } from "../../localStorage/localVisitTrackerTabId"

export async function handleOnRemoved(tabId, removeInfo){
    delLocalVisitTabIdTracker(tabId)
    delLocalBlockedScreenDataByTabId(tabId)
    delLocalRestrictedScreenDataByTabId(tabId)
    delLocalTimeLimitScreenDataByTabId(tabId)
  }