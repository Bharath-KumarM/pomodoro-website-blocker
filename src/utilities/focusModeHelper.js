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
            }else{
                daysDescArr.push(null)
            }
        }

        let daysDescArr2 = []
        for (let i=0; i<daysDescArr.length; i++){
            if (!daysDescArr[i]) continue;

            const clubedDays = []

            for (let j=i+1; j<daysDescArr.length; j++){
                if (!daysDescArr[j]) break
                clubedDays.push(daysDescArr[j])
            }

            if (clubedDays.length < 2){
                daysDescArr2.push(daysDescArr[i])
            }else{
                daysDescArr2.push(`${daysDescArr[i]} to ${clubedDays[clubedDays.length-1]}`)
                i += clubedDays.length
            }
        }


        let daysDesc = ''
        for (let i=0; i<daysDescArr2.length; i++){
            if (i === daysDescArr2.length-2){
                daysDesc += (daysDescArr2[i] + ' and ')
            } else if (i === daysDescArr2.length-1){
                daysDesc += (daysDescArr2[i])
            }
            else{
                daysDesc += (daysDescArr2[i] + ', ')
            }
        }
        return daysDesc
    }

    const daysDesc = getDayDesc(days)

    return `From ${startHr}:${startMin} ${startAmPM} to ${endHr}:${endMin} ${endAmPM} on ${daysDesc}`

}