import { getDayNumber } from "./date"

export async function getIsTimeBtwFocusSchedule(){
    const {scheduleData} = await chrome.storage.local.get('scheduleData')

    const scheduleTimeBtwNos = [] 
    for (let i=0; i<scheduleData.length; i++){
      const scheduleItemData = scheduleData[i]
      // Get Start & End Time
      const [startTime, endTime, days] = scheduleItemData
      const [startHr, startMin, startAmPM] = startTime.split(':')
      const [endHr, endMin, endAmPM] = endTime.split(':')
      let start24Hr =  parseInt(startHr)
      if (startAmPM === 'PM') start24Hr += 12
      let end24Hr = parseInt(endHr)
      if (endAmPM === 'PM') end24Hr += 12

      const currDayNum = getDayNumber(0)
      const startTimeObj = new Date()
      startTimeObj.setHours(start24Hr, parseInt(startMin))
  
      const endTimeObj = new Date()
      endTimeObj.setHours(end24Hr, parseInt(endMin))
  
      const currTimeObj = new Date()
      if (days[currDayNum] && startTimeObj <= currTimeObj && endTimeObj >=  currTimeObj){
        scheduleTimeBtwNos.push(i)
      }
    }
    if (scheduleTimeBtwNos.length > 0){
        return scheduleTimeBtwNos
    } else{
        return false
    }
  
  }
export const getCurrScheduleDesc = async ()=>{
    const scheduleTimeBtwNos = await getIsTimeBtwFocusSchedule()
    if (!scheduleTimeBtwNos) return  null
    const firstActiveScheduleIndex = scheduleTimeBtwNos[0]

    const {scheduleData} = await chrome.storage.local.get('scheduleData')
    
    return getScheduleItemDesc(scheduleData[firstActiveScheduleIndex])

}
export const getScheduleItemDesc = (scheduleItemData)=>{
    const [startTime, endTime, days] = scheduleItemData
    const [startHr, startMin, startAmPM] = startTime.split(':')
    const [endHr, endMin, endAmPM] = endTime.split(':')

    const daysString3 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const getDayDesc = (days)=>{
        if (!days.includes(false)) return 'every day'
        let daysDescArr = []
        for (let i=0; i<days.length; i++){
            if (days[i]){
                daysDescArr.push(daysString3[i])
            }
        }


        let daysDesc = ''
        for (let i=0; i<daysDescArr.length; i++){
            if (i === daysDescArr.length-2){
                daysDesc += (daysDescArr[i] + ' and ')
            } else if (i === daysDescArr.length-1){
                daysDesc += (daysDescArr[i])
            }
            else{
                daysDesc += (daysDescArr[i] + ', ')
            }
        }
        return daysDesc
    }

    const daysDesc = getDayDesc(days)

    return `From ${startHr}:${startMin} ${startAmPM} to ${endHr}:${endMin} ${endAmPM} on ${daysDesc}`

}