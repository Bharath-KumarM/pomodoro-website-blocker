import { refreshAllRestrictedScreenTabs, refreshAllRestrictedSites } from "../utilities/chrome-tools/refreshTabs"

// todo: change TakeABreakTrackerforRestrict to takeABreakTrackerforRestrict
export const getLocalTakeABreakTrackerforRestrict = async ()=>{
    return await chrome.storage.local.get('takeABreakTrackerforRestrict')
}

export const setLocalTakeABreakTrackerforRestrict = async (takeABreakTrackerforRestrict)=>{
    await chrome.storage.local.set({takeABreakTrackerforRestrict})
    return true;

}
export const turnOffLocalTakeABreakTrackerforRestrict = async (isAlarmCleared=false)=>{
    await setLocalTakeABreakTrackerforRestrict(false)
    refreshAllRestrictedSites()

    if (!isAlarmCleared){
        await chrome.alarms.clear('takeABreakForRestrict')
        console.log('break alarm cleared!!!')
    }
    return true;
}
export const turnOnLocalTakeABreakTrackerforRestrict = async (takeABreakTrackerforRestrict)=>{
    await setLocalTakeABreakTrackerforRestrict(takeABreakTrackerforRestrict)
    refreshAllRestrictedScreenTabs()
    return true;
}