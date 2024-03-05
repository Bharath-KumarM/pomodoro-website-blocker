import { refreshAllBlockedScreenTabs, refreshAllTabsByHostname } from "../utilities/chrome-tools/refreshTabs"

// *scheduleData
export const getLocalScheduleData = async ()=>{
    return await chrome.storage.local.get('scheduleData') || {scheduleData: []}
}
export const setLocalScheduleData = async (scheduleData)=>{
    return await chrome.storage.local.set({scheduleData})
}

export const updateLocalScheduleData = async (scheduleItem, editIndex)=>{
    const {scheduleData} = await getLocalScheduleData()
    
    const isNewSchedule = editIndex > scheduleData.length-1

    // Duplicate Schedule
    const duplicateScheduleIndex = findDuplicateScheduleIndex(scheduleData, scheduleItem)
    if (typeof duplicateScheduleIndex === 'number') {
        return {duplicateScheduleIndex, isNewSchedule}
    }


    let newScheduleData = scheduleData.map(val=>val)

    // New schedule
    if (isNewSchedule) newScheduleData.unshift(scheduleItem)
    // Modify existing Schedule
    else newScheduleData[editIndex] = scheduleItem

    await setLocalScheduleData(newScheduleData)

    return {duplicateScheduleIndex, isNewSchedule}

}
export const delLocalScheduleDataByIndex = async (index)=>{

    const {scheduleData} = await getLocalScheduleData()

    // delete by index
    const newScheduleData = scheduleData.filter((val, i)=> i!=index)
    await setLocalScheduleData(newScheduleData)

    // todo: Is Refresh tabs needed 
    
    return true; 
}

// Simple Helper functions
function findDuplicateScheduleIndex(scheduleData, newScheduleItem){
    //todo: logic for overlapping schedule

    const [newStartTime, newEndTime, newDaysActiveArr] = newScheduleItem
    for (let i=0; i<scheduleData.length; i++){
        const [startTime, endTime, daysActiveArr] = scheduleData[i]

        if (newStartTime === startTime && newEndTime === endTime &&  JSON.stringify(newDaysActiveArr) === JSON.stringify(daysActiveArr)) {
            return i+1
        }
    }

    return false
}
