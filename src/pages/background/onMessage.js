import { handleTakeABreakClick, turnOffLocalTakeABreakTrackerforRestrict } from "../../localStorage/localTakeABreakTrackerforRestrict"
import { updateLocalTimeLimitScreenDataByTab } from "../../localStorage/localTimeLimitScreenData"
import { handleUpdateBadgeIcon } from "./helper"

export async function handleOnMessage(request, sender, sendResponse){
    //* available requests
    const { 
        msg, 
        getTabId,
        checkCurrentTabAudible,
        updateBadgeIcon,
        updateLocalTimeLimitScreenDataByTabMsg,
        handleTurnOffLocalTakeABreakTrackerforRestrict,
        createTakeABreak
       } = request
  
    if (getTabId){
      sendResponse({tabId: sender.tab.id})
    }
  
    if (checkCurrentTabAudible){
        sendResponse({audible: sender.tab.audible})
    }
  
    if (updateBadgeIcon){
      const {hostname} = updateBadgeIcon
      const tabId = sender.tab.id
  
      const {isBadgeUpdated} = handleUpdateBadgeIcon({tabId, hostname}).then(()=>{
  
      })
      sendResponse({isBadgeUpdated :true})
      
    }
  
    if (updateLocalTimeLimitScreenDataByTabMsg){
      const [tabId, [hostname, favIconUrl, url]] = updateLocalTimeLimitScreenDataByTabMsg
      updateLocalTimeLimitScreenDataByTab(tabId, [hostname, favIconUrl, url]).then(()=>{
        sendResponse(true)
      })
    }
  
    if (handleTurnOffLocalTakeABreakTrackerforRestrict){
      turnOffLocalTakeABreakTrackerforRestrict({isForceTurnOff: true, shouldRefreshSites: true}).then(()=>{
        sendResponse(true)
      })
    }
    
    if(createTakeABreak){
      turnOffLocalTakeABreakTrackerforRestrict({isForceTurnOff: true, shouldRefreshSites: false}).then(()=>{
        const {timeInMinutes} = createTakeABreak
        handleTakeABreakClick(timeInMinutes).then(()=>{
          sendResponse(true)
        })
      })
    }
    return true;
  }