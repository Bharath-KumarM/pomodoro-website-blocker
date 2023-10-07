import { refreshAllRestrictedScreenTabs, refreshAllRestrictedSites } from "../utilities/chrome-tools/refreshTabs"

// todo: change TakeABreakTrackerforRestrict to takeABreakTrackerforRestrict
export const initializeLocalTakeABreakTrackerforRestrict = async ()=>{
    const {takeABreakTrackerforRestrict} = await chrome.storage.local.get('takeABreakTrackerforRestrict')
    if (takeABreakTrackerforRestrict === undefined){
      await chrome.storage.local.set({takeABreakTrackerforRestrict: false})
    }
}
export const getLocalTakeABreakTrackerforRestrict = async ()=>{
    return await chrome.storage.local.get('takeABreakTrackerforRestrict')
}

export const setLocalTakeABreakTrackerforRestrict = async (takeABreakTrackerforRestrict)=>{
    await chrome.storage.local.set({takeABreakTrackerforRestrict})
    return true;

}
export const turnOffLocalTakeABreakTrackerforRestrict = async ({isForceTurnOff, shouldRefreshSites})=>{
    await setLocalTakeABreakTrackerforRestrict(false)
    if (shouldRefreshSites){
        refreshAllRestrictedSites()
    }

    if (isForceTurnOff){
        await chrome.alarms.clear('takeABreakForRestrict')
        await chrome.alarms.clear('takeABreakForRestrictBefore2minute')
        await chrome.alarms.clear('takeABreakForRestrictBefore1minute')
        console.log('break alarm cleared!!!')
    }

    return true;
}
export const turnOnLocalTakeABreakTrackerforRestrict = async (takeABreakTrackerforRestrict)=>{
    await setLocalTakeABreakTrackerforRestrict(takeABreakTrackerforRestrict)
    refreshAllRestrictedScreenTabs()
    return true;
}

export const handleTakeABreakClick = async (timeInMinutes)=>{
    const currTimeObj = Date.now()

    const minToSecConvertor = 60 // 60 is default value for debugging quick, change inside getTakeABreakTrackerforRestrictData as well

    turnOnLocalTakeABreakTrackerforRestrict(currTimeObj + (timeInMinutes*minToSecConvertor*1000))

    await chrome.alarms.create(
        `takeABreakForRestrict`,
        {
            when: currTimeObj + (timeInMinutes*minToSecConvertor*1000),
        }
    )
    await chrome.alarms.create(
        `takeABreakForRestrictBefore2minute`,
        {
            when: currTimeObj + ((timeInMinutes - 2)*minToSecConvertor*1000),
        }
    )
    await chrome.alarms.create(
        `takeABreakForRestrictBefore1minute`,
        {
            when: currTimeObj + ((timeInMinutes - 1)*minToSecConvertor*1000),
        }
    )


}