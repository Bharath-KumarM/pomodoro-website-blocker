import { getDateString } from "../utilities/date"

// *noOfVisitsTracker
export const initializeLocalNoOfVisitsTracker = async ()=>{
    const {noOfVisitsTracker} = await chrome.storage.local.get('noOfVisitsTracker')
    if (noOfVisitsTracker === undefined){
      await chrome.storage.local.set({noOfVisitsTracker: {}})
    }
}
export const getLocalNoOfVisitsTracker = async ()=>{
    return await chrome.storage.local.get('noOfVisitsTracker')
}
export const setLocalNoOfVisitsTracker = async (noOfVisitsTracker)=>{
    return await chrome.storage.local.set({noOfVisitsTracker})
}

export const getLocalNoOfVisitsTrackerForDayByHostname = async (dateString, hostname)=>{
    const {noOfVisitsTracker} = await getLocalNoOfVisitsTracker()

    return noOfVisitsTracker?.[dateString]?.[hostname]?.[1] ?? 0;
}

export const delLocalNoOfVisitsTrackerByDate = async (dateString)=>{
    const {noOfVisitsTracker} = await getLocalNoOfVisitsTracker()

    if (noOfVisitsTracker[dateString]) delete noOfVisitsTracker[dateString]
    setLocalNoOfVisitsTracker(noOfVisitsTracker)
}

// Cleans all data older than last 60 days
export const cleanLocalNoOfVisitsTracker = async ()=>{

    const {noOfVisitsTracker} = await getLocalNoOfVisitsTracker()

    // Note: reversed for date compare
    const date30DaysAgo = getDateString(-30).split('-').reverse().join('-')

    const deleteDates = []
    const dates = Object.keys(noOfVisitsTracker)
    dates.map((date)=>{
        const revDate = date.split('-').reverse().join('-')
        if ( revDate <  date30DaysAgo ){
            // Old data deleted
            delete noOfVisitsTracker[date]
            deleteDates.push(revDate)
        }
    })

    console.log({
        noOfVisitsTrackerDeletedDateOnStartUpEvent: deleteDates
    })
    await setLocalNoOfVisitsTracker(noOfVisitsTracker)
}