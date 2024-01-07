import { getDateString } from "../utilities/date"

// *screenTimeTracker
export const getLocalScreenTimeTracker = async ()=>{
    const {screenTimeTracker} = await chrome.storage.local.get('screenTimeTracker')
    return screenTimeTracker ?? {}
}

export const getLocalScreenTimeTrackerForDayByHostname = async (dateString, hostname)=>{
    const screenTimeTracker = await getLocalScreenTimeTracker()

    return Math.round(screenTimeTracker?.[dateString]?.[hostname] ?? 0);
}
export const getLocalScreenTimeTrackerForDay = async (dateString, hostname)=>{
    const screenTimeTracker = await getLocalScreenTimeTracker()

    return screenTimeTracker?.[dateString] ?? {};
}

export const setLocalScreenTimeTracker = async (screenTimeTracker)=>{
    return await chrome.storage.local.set({screenTimeTracker})
}

// Cleans all data older than last 60 days
export const cleanLocalScreenTimeTracker = async ()=>{

    const screenTimeTracker = await getLocalScreenTimeTracker()

    // Note: reversed for date compare
    const dateXDaysAgo = getDateString(-30).split('-').reverse().join('-')

    const deletedDates = []
    const dates = Object.keys(screenTimeTracker)
    dates.map((date)=>{
        const revDate = date.split('-').reverse().join('-')
        if ( revDate <  dateXDaysAgo ){
            // Old data deleted
            delete screenTimeTracker[date]
            deletedDates.push(revDate)
        }
    })

    // Log
    console.log({
        screenTimeTrackerDeletedDateOnStartUpEvent: deletedDates
    })
    await setLocalScreenTimeTracker(screenTimeTracker)
}