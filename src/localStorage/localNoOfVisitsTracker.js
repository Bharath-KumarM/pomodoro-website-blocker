// *noOfVisitsTracker
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