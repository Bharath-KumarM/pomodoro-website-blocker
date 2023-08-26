import './TimeInputPopup.scss'

import { HiArrowSmUp, HiArrowSmDown } from "react-icons/hi"
import { BiInfoCircle, BiTime } from "react-icons/bi"
import { useEffect, useRef, useState } from 'react'
import { RiCloseLine } from 'react-icons/ri'
import { pad2 } from './simpleTools'
import { getLocalScheduleData, updateLocalScheduleData } from '../localStorage/localScheduleData'

const hrValues = Array.from({length: 12}, (_ ,index)=>pad2(index+1))
const minValues = Array.from({length: 12}, (_ ,index)=>pad2(index*5))
const amPmValues = ['am', 'pm']


const TimeInputPopup = ({setEditTimeInputIndex, editTimeInputIndex, getScheduleData, isNewSchedule, setToastData})=>{
    const [startTime, setStartTime] = useState(isNewSchedule ? '10:00:am' : null);
    const [endTime, setEndTime] = useState(isNewSchedule ? '05:00:pm' : null);
    const [daysActiveArr, setDaysActiveArr] = useState(isNewSchedule ? [false, true, true, true, true, true, false] : null)
    
    const daysLetterArr = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

    const handleExistingScheduleEdit = async ()=>{
        const {scheduleData} = await getLocalScheduleData()
        if (!scheduleData[editTimeInputIndex]) return
        const [storedStartTime, storedEndTime, storedDaysActiveArr] = scheduleData[editTimeInputIndex]
        setStartTime(storedStartTime)
        setEndTime(storedEndTime)
        setDaysActiveArr([...storedDaysActiveArr])
    }
    useEffect(()=>{
        if (!isNewSchedule) handleExistingScheduleEdit()
    }, [])

    if (startTime === null){ // Loading existing Schedule
        return (
            <div>
                Loading...
            </div>
        )
    }

    const {hrDiff, minDiff} = getTimeDifference(startTime, endTime)
    const isEndTimeGreater = getIsEndTimeGreater({hrDiff, minDiff})
    const isDaysValid = daysActiveArr.includes(true)
    const isUserInputValid = (isEndTimeGreater && isDaysValid)


    const handleAddScheduleSubmit = async ()=>{
        if (!isEndTimeGreater) return null;
        const newScheduleItem = [startTime, endTime, daysActiveArr]

        const {
            duplicateScheduleIndex,
            isNewSchedule,
        } = await updateLocalScheduleData(newScheduleItem, editTimeInputIndex)

        // Duplicate Schedule
        if (typeof duplicateScheduleIndex === 'number'){
            setToastData([`Duplicate of Schedule ${duplicateScheduleIndex}`, 'red'])
            setEditTimeInputIndex(-1) // Closes the pop screen
            return null;
        }

        // get updated schedule data
        getScheduleData()

        setEditTimeInputIndex(-1) // Closes the pop screen
        if (isNewSchedule) setToastData(['A new schedule has been added', 'green'])
        else setToastData(['Schedule has been modified'])
    }

    return (
        <div className='time-input-popup-cnt'
            onClick={e=>e.stopPropagation()}
        >
            <button 
                className='close btn'
                onClick={()=>{
                    setEditTimeInputIndex(-1)
                }}
            >
                <RiCloseLine />
            </button>

            <h3 className="heading">
                Start Time
            </h3>
            <div className="time-input-cnt">
                <select 
                    id="time-hr" 
                    className='time-input hr'
                    defaultValue={startTime.split(":")[0]}
                    onChange={(e)=> {
                        let [hr, min, amPm] = startTime.split(":")
                        hr = e.target.value //new hour
                        handleOnChnageTime({hr, min, amPm, setTime: setStartTime})
                    }}
                >
                    {
                        hrValues.map((val, index)=>{
                            return <option key={index}>{val}</option>
                        })
                    }
                </select>
                <div className="colon">
                    :
                </div>
                <select 
                    id="time-min" 
                    className='time-input min'
                    defaultValue={startTime.split(":")[1]}
                    onChange={(e)=> {
                        let [hr, min, amPm] = startTime.split(":")
                        min = e.target.value //new hour
                        handleOnChnageTime({hr, min, amPm, setTime: setStartTime})
                    }}
                >
                    {
                        minValues.map((val, index)=>{
                            return <option key={index}>{val}</option>
                        })
                    }
                </select>
                <select 
                    id="time-am-pm" 
                    className='time-input am-pm'
                    defaultValue={startTime.split(":")[2]}
                    onChange={(e)=> {
                        let [hr, min, amPm] = startTime.split(":")
                        amPm = e.target.value //new hour
                        handleOnChnageTime({hr, min, amPm, setTime: setStartTime})
                    }}
                > 
                    {
                        amPmValues.map((val, index)=>{
                            return <option key={index}>{val}</option>
                        })
                    }
                </select>
                <BiTime />
            </div>
            <h3 className="heading">
                End  Time
            </h3>
            <div className="time-input-cnt">
                <select 
                    id="time-hr" 
                    className='time-input hr'
                    defaultValue={endTime.split(":")[0]}
                    onChange={(e)=> {
                        let [hr, min, amPm] = endTime.split(":")
                        hr = e.target.value //new hour
                        handleOnChnageTime({hr, min, amPm, setTime: setEndTime})
                    }}
                >
                    {
                        hrValues.map((val, index)=>{
                            return <option key={index}>{val}</option>
                        })
                    }
                </select>
                <div className="colon">
                    :
                </div>
                <select 
                    id="time-min" 
                    className='time-input min'
                    defaultValue={endTime.split(":")[1]}
                    onChange={(e)=> {
                        let [hr, min, amPm] = endTime.split(":")
                        min = e.target.value //new hour
                        handleOnChnageTime({hr, min, amPm, setTime: setEndTime})
                    }}
                >
                    {
                        minValues.map((val, index)=>{
                            return <option key={index}>{val}</option>
                        })
                    }
                </select>
                <select 
                    id="time-am-pm" 
                    className='time-input am-pm'
                    defaultValue={endTime.split(":")[2]}
                    onChange={(e)=> {
                        let [hr, min, amPm] = endTime.split(":")
                        amPm = e.target.value //new hour
                        handleOnChnageTime({hr, min, amPm, setTime: setEndTime})
                    }}
                > 
                    {
                        amPmValues.map((val, index)=>{
                            return <option key={index}>{val}</option>
                        })
                    }
                </select>
                <BiTime />
            </div>

            <h3 className="heading">
                Days
            </h3>
            <div className="day-cnt">
                {
                    daysLetterArr.map((dayLetter, index)=>{
                        return (
                            <DayLetter 
                                key={index}
                                dayLetter={dayLetter} 
                                index={index}
                                daysLetterArr={daysLetterArr} 
                                daysActiveArr={daysActiveArr} 
                                setDaysActiveArr={setDaysActiveArr}
                            />
                        )
                    })
                }
            </div>

            <div className="note-cnt">
                {/* <BiInfoCircle /> */}
                <p className={isUserInputValid ? '' : 'user-input-valid'}>
                    {
                        !isDaysValid ?
                        'No Days have been selected' :
                        isEndTimeGreater ?
                        `Time duration ${hrDiff} hrs ${minDiff} mins each day` :
                        "Start Time should be greater than End Time" 
                    }
                </p>
            </div>

            <input 
                value='Schedule'
                className={isUserInputValid ? 'set-input active' : 'set-input'}
                type="submit" 
                onClick={(e)=> handleAddScheduleSubmit()}

            />
            <div className="cancel-cnt"
                onClick={()=>{
                    setEditTimeInputIndex(-1) // Closes the pop screen
                }}
            >
                Cancel
            </div>

        </div>
    )
    
}

export default TimeInputPopup


const TimeCnt = ({time, setTime})=>{
    

    const handleOnWheel = (e)=>{
        // On Decrement  
        if (e.deltaY > 0) {
            setTime((prevTime)=>{
                if (prevTime > 1){
                    return prevTime- 1
                }
                return prevTime
            })
        } 
        // On Increment
        else if (e.deltaY < 0) {
            setTime((prevTime)=>{
                if (prevTime < 12){
                    return prevTime + 1
                }
                return prevTime
            })
        }
    }

    return (
    <div 
        className="time-cnt"
        onWheel={(e)=>handleOnWheel(e)}
    >
        <div className="time-text-cnt">
            <div className="time-sm hr-up">
                {time-1}
            </div>
            <div className="time-lg">
                {('0'+time).slice(-2)}
            </div>
            <div className="time-sm time-down">
                {time+1}
            </div>
        </div>
        <div className="btn-cnt">
            <button 
                className='up'
                onClick={()=>{
                    setTime((prev)=>prev+1)
                }}
            > 
                <HiArrowSmUp />
            </button>
            <button 
                className='down'
                onClick={()=>{
                    setTime((prev)=>prev-1)
                }}
                >
                <HiArrowSmDown />
            </button>
        </div>
    </div>
    )
}

const DayLetter = ({dayLetter, index, daysActiveArr, setDaysActiveArr})=>{
    const tempClass = daysActiveArr[index] ? 'day active' : 'day'

    return (
        <span className={tempClass}
            key={index}
            onClick={()=>{
                daysActiveArr[index] = !daysActiveArr[index]
                setDaysActiveArr([...daysActiveArr])
            }}
        >
            {dayLetter}
        </span>
    )
}
// Helper function

function handleOnChnageTime({hr, min, amPm, setTime}){
    setTime(`${hr}:${min}:${amPm}`)
}

function getIsEndTimeGreater({minDiff, hrDiff}){
    return hrDiff > 0 || (hrDiff === 0 && minDiff > 0)
}

function getTimeDifference(startTime, endTime){
    const [startHr, startMin, startAmPM] = startTime.split(':')
    const [endHr, endMin, endAmPM] =  endTime.split(':')


    const date1 = new Date(`08/05/2015 ${startHr}:${startMin}:00 ${startAmPM}`);
    const date2 = new Date(`08/05/2015 ${endHr}:${endMin}:00 ${endAmPM}`);

    let diff = date2.getTime() - date1.getTime();

    let msec = diff;
    let hrDiff = Math.floor(msec / 1000 / 60 / 60);
    msec -= hrDiff * 1000 * 60 * 60;
    let minDiff = Math.floor(msec / 1000 / 60);
    msec -= minDiff * 1000 * 60;
    let sec = Math.floor(msec / 1000);
    msec -= sec * 1000;

    return {hrDiff, minDiff}
}