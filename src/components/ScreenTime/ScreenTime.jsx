import Graph from './Graph';
import "./ScreenTime.scss";

import { AiFillCaretDown as DropDownIcon} from "react-icons/ai";
import { AiOutlineLeft as LeftArrowIcon} from "react-icons/ai";
import { AiOutlineRight as RightArrowIcon} from "react-icons/ai";
import { useEffect, useState } from 'react';
import { getDateString, getDayNumber, getDayString, getFullDate, getHrMinString } from '../../utilities/date';

const ScreenTime = ()=>{

    const [screenTimeData, setScreenTimeData] = useState(null)
    const [day, setDay] = useState(0)

    const getInfo = async (day)=>{
        let {screenTimeTracker} = await chrome.storage.local.get('screenTimeTracker')
        let {noOfVisitsTracker} = await chrome.storage.local.get('noOfVisitsTracker')

        
        const dateString = getDateString(day)
        const fullDate = getFullDate(day)
        
        const dayNumOfWeek = getDayNumber(day)
        const totalScreenTimeWeekly = []

        // data for Graph
        const weekStartDay = day-dayNumOfWeek
        for (let i=weekStartDay; i<7+weekStartDay; i++){
            const tempDateString = getDateString(i)
            const tempScreenTimeTracker = screenTimeTracker[tempDateString]
            const totalTimeSpentInSec = getTotalTimeFromTracker(tempScreenTimeTracker)

            totalScreenTimeWeekly.push(totalTimeSpentInSec)
        }

        const dayScreenTimeTracker = screenTimeTracker[dateString] ? screenTimeTracker[dateString] : null
        const dayNoOfVisitsTracker = noOfVisitsTracker[dateString] ? noOfVisitsTracker[dateString]  : {}
        setScreenTimeData({dayScreenTimeTracker, fullDate, totalScreenTimeWeekly, dayNoOfVisitsTracker})

    }

    useEffect(()=>{
        getInfo(day)
    },[day])

    if (screenTimeData===null) return (
        <h3 className='screen-time-cnt empty'>
            Loading...
        </h3>
    )

    const {dayScreenTimeTracker, fullDate, totalScreenTimeWeekly, dayNoOfVisitsTracker} = screenTimeData

    const totalTimeSpentInSec = getTotalTimeFromTracker(dayScreenTimeTracker)
    const totalTimeSpentDesc = getHrMinString(totalTimeSpentInSec)

    return (
        <div className="screen-time-cnt">
            {/* <div className="dropdown-cnt">
                <p className="desc">Screen Time</p>
                <DropDownIcon />
            </div> */}
            <div className="screen-time-details-cnt">
                <h2 className="screen-time-detail">
                    {totalTimeSpentDesc ? totalTimeSpentDesc : '0 minutes'}
                </h2>
                <p className="screen-time-day">
                    {getDayAgo(day)}
                </p>
            </div>
            <Graph 
                totalScreenTimeWeekly={totalScreenTimeWeekly}
                weekDayNum={getDayNumber(day)}
                day={day}
                setDay={setDay}
            />
            <div className="day-cnt">
                <button 
                    className="day-arrow left"
                    onClick={()=>{
                        setDay(prevDay => prevDay-1)
                    }}
                    >
                    <LeftArrowIcon />
                </button>
                <div className="day-details">
                    {fullDate}
                </div>
                <button 
                    className="day-arrow right"
                    onClick={()=>{
                        setDay(prevDay => prevDay+1)
                    }}
                >
                    <RightArrowIcon />
                </button>
            </div>
            <div className="site-list-cnt">
                <ul className='site-list'>
                    {getSiteListArr(dayScreenTimeTracker, dayNoOfVisitsTracker)}
                </ul>
            </div>
        </div>
    )
}
const getDayAgo = (day)=>{
    if (day > 1) return `${day} days from today`
    if (day === 1) return 'Tomorrow'
    if (day === 0) return 'Today'
    if (day === -1) return 'Yesterday'
    if (day < -1) return `${day*-1} days ago`

}
const getTotalTimeFromTracker = (dayScreenTimeTracker)=>{
    let timeSpentInSeconds = 0
    for (const site in dayScreenTimeTracker){
        const secondsSpent = dayScreenTimeTracker[site]
        timeSpentInSeconds+=secondsSpent
    }
    return  timeSpentInSeconds

}
const getSiteListArr = (dayScreenTimeTracker, dayNoOfVisitsTracker)=>{
    const dayScreenTimeTrackerArr = []
    for (const site in dayScreenTimeTracker){
        const secondsSpent = dayScreenTimeTracker[site]
        dayScreenTimeTrackerArr.push([site, secondsSpent])
    }

    if (dayScreenTimeTrackerArr.length < 1){
        // Empty time tracker
        return (
            <li className='site-list-item-empty'>
                <h1>
                    No Data
                </h1>
            </li>
        )

    }

    dayScreenTimeTrackerArr.sort((a, b)=>b[1]-a[1])

    const siteListArr = []
    for (const [site, secondsSpent] of dayScreenTimeTrackerArr){
        const visitTimesDesc = dayNoOfVisitsTracker[site] ? `• ${dayNoOfVisitsTracker[site]} opens` : ''
        const item = (
            <li className='site-list-item'>
                <img className='site-itme-icon' src={`http://www.google.com/s2/favicons?domain=${site}&sz=${128}`} alt="icon" />
                <div className="site-item-info">
                    <p className='site-item-name'>{site}</p>
                    <p className='site-item-screen-time'>{`${getHrMinString(secondsSpent)} ${visitTimesDesc}`}</p>
                </div>
            </li>
        )
        siteListArr.push(item)
    }

    return siteListArr
}
export default ScreenTime

