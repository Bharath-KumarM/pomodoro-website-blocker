import { getLocalScheduleData } from "../localStorage/localScheduleData"
import { getDayNumber } from "./date"

// Helper function
function setHours(dt, h) {
    var s = /(\d+):(\d+)(.+)/.exec(h);
    dt.setHours(
            (s[3] === "am" && parseInt(s[1], 10) === 12) ?
            0 :
            s[3] === "pm" ? 
            12 + parseInt(s[1], 10) : 
            parseInt(s[1], 10)
        );
    dt.setMinutes(parseInt(s[2],10));
    }

export async function checkFocusScheduleActive(){
    const {scheduleData} = await getLocalScheduleData()

    for (let i=0; i<scheduleData.length; i++){
      const scheduleItemData = scheduleData[i]
      const [startTime, endTime, days] = scheduleItemData

      const [startHr, startMin, startAmPM] = startTime.split(':')
      const [endHr, endMin, endAmPM] = endTime.split(':')
      
      const currDayNum = getDayNumber(0)
      const currTimeObj = new Date()

      const startTimeObj = new Date();
      setHours(startTimeObj, `${parseInt(startHr)}:${parseInt(startMin)}${startAmPM}`)
  
      const endTimeObj = new Date();
      setHours(endTimeObj, `${parseInt(endHr)}:${parseInt(endMin)}${endAmPM}`)

      if (days[currDayNum] && startTimeObj <= currTimeObj && endTimeObj >=  currTimeObj){
        return true;
      }
    }
    
    return false
  }
export async function getActiveFocusScheduledIndexes(){
    const {scheduleData} = await getLocalScheduleData()

    const activeScheduleIndexes = [] 
    for (let i=0; i<scheduleData.length; i++){
      const scheduleItemData = scheduleData[i]
      const [startTime, endTime, days] = scheduleItemData

      const [startHr, startMin, startAmPM] = startTime.split(':')
      const [endHr, endMin, endAmPM] = endTime.split(':')

      const currDayNum = getDayNumber(0)
      const currTimeObj = new Date()

      const startTimeObj = new Date();
      setHours(startTimeObj, `${parseInt(startHr)}:${parseInt(startMin)}${startAmPM}`)
 
      const endTimeObj = new Date();
      setHours(endTimeObj, `${parseInt(endHr)}:${parseInt(endMin)}${endAmPM}`)

      if (days[currDayNum] && startTimeObj <= currTimeObj && endTimeObj >=  currTimeObj){
        activeScheduleIndexes.push(i)
      }
    }

    return activeScheduleIndexes
  }
export const getCurrScheduleDesc = async ()=>{
    const scheduleTimeBtwNos = await getActiveFocusScheduledIndexes()
    if (!scheduleTimeBtwNos) return  null
    const firstActiveScheduleIndex = scheduleTimeBtwNos[0]

    const {scheduleData} = await getLocalScheduleData()
    
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


        let daysDesc = 'on '
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

    return `${startHr}:${startMin} ${startAmPM} to ${endHr}:${endMin} ${endAmPM} ${daysDesc}`

}