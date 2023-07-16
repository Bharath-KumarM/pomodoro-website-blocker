import { getDateString } from "../utilities/date"

// *visitTracker
export const initializeLocalVisitTracker = async ()=>{
    const {visitTracker} = await chrome.storage.local.get('visitTracker')
    if (visitTracker=== undefined){
      await chrome.storage.local.set({visitTracker: {}})
    }
}
export const getLocalVisitTracker = async ()=>{
    return await chrome.storage.local.get('visitTracker')
}

export const getLocalVisitTrackerForDayByHostname = async (hostname, dateString)=>{
    const {visitTracker} = await getLocalVisitTracker ()

    return Math.round(visitTracker?.[dateString]?.[hostname] ?? 0);
}
export const getLocalVisitTrackerForDay = async (dateString)=>{
    const {visitTracker} = await getLocalVisitTracker ()

    return Math.round(visitTracker?.[dateString] ?? {});
}

export const setLocalVisitTracker = async (visitTracker)=>{
    return await chrome.storage.local.set({visitTracker})
}

export const incrementLocalVisitTracker = async (hostname) => {
    const {visitTracker} = await getLocalVisitTracker ()
    const dateString = getDateString()

    visitTracker[dateString] = visitTracker[dateString] ?? {}

    const count =  visitTracker[dateString][hostname] ?? 0
    visitTracker[dateString][hostname] = count + 1

    await setLocalVisitTracker(visitTracker)
    
    return visitTracker[dateString][hostname] 
}

// Cleans all data older than last 60 days
export const cleanLocalVisitTracker = async ()=>{

    const {visitTracker} = await getLocalVisitTracker ()

    // Note: reversed for date compare
    const dateXDaysAgo = getDateString(-30).split('-').reverse().join('-')

    const deletedDates = []
    const dates = Object.keys(visitTracker)
    dates.map((date)=>{
        const revDate = date.split('-').reverse().join('-')
        if ( revDate <  dateXDaysAgo ){
            // Old data deleted
            delete visitTracker[date]
            deletedDates.push(revDate)
        }
    })

    // Log
    console.log({
        visitTrackerDeletedDateOnStartUpEvent: deletedDates
    })
    await setLocalVisitTracker (visitTracker)
}