import Graph from './Graph';
import "./ScreenTime.scss";

import { FaHourglass, FaRegHourglass } from "react-icons/fa";
import { AiOutlineLeft as LeftArrowIcon} from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import { MdSettingsSuggest } from "react-icons/md";
import { AiOutlineRight as RightArrowIcon} from "react-icons/ai";
import { useEffect, useState } from 'react';
import { getDateString, getDayNumber, getFullDate, getHrMinString } from '../../../utilities/date';
import { PopupFull, PopupToast } from '../../../utilities/PopupScreens';
import TimeLimitInput from './TimeLimitInput';
import SiteTimeLimitScreen from './SitesTimeLimitScreen';

import { getLocalScreenTimeTracker } from '../../../localStorage/localScreenTimeTracker';
import { getLocalVisitTrackerForDay } from '../../../localStorage/localVisitTracker';
import Loader from '../../../utilities/Loader';
import { getScreenTimeLimit } from '../../../localStorage/localSiteTagging';



const ScreenTime = ()=>{

    const [screenTimeData, setScreenTimeData] = useState(null)
    const [day, setDay] = useState(0)
    const [showTimeLimitInput, setShowTimeLimitInput] = useState(false) 

    const [showSitesTimeLimitScreen, setShowSitesTimeLimitScreen] = useState(false)

    const [toastData, setToastData] = useState([null, null]) //* Toast Message from bottom

    const [screenTimeLimit, setScreenTimeLimit] = useState(null)

    const [isDataAllLoaded, setIsDataAllLoaded] = useState(false)

    useEffect(()=>{
        const getInfo = async (day)=>{
            let screenTimeTracker = await getLocalScreenTimeTracker()

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

            const dayScreenTimeTracker = screenTimeTracker[dateString] ? screenTimeTracker[dateString] : {}
            const dayNoOfVisitsTracker = await getLocalVisitTrackerForDay(dateString)

            setScreenTimeData({dayScreenTimeTracker, fullDate, totalScreenTimeWeekly, dayNoOfVisitsTracker})

            setIsDataAllLoaded(true)
        }

        getInfo(day)
    },[day])

    useEffect(()=>{
        const getData = async ()=>{
            let screenTimeLimit = await getScreenTimeLimit()
            setScreenTimeLimit(screenTimeLimit)
        }

        if (screenTimeLimit === null){
            getData()
        }
    }, [screenTimeLimit])

    const [toastMsg, toastColorCode] = toastData

    if (screenTimeData===null) {

        return (
            <Loader/>
        )
    }

    const {dayScreenTimeTracker, fullDate, totalScreenTimeWeekly, dayNoOfVisitsTracker} = screenTimeData;

    const totalTimeSpentInMins = getTotalTimeFromTracker(dayScreenTimeTracker)
    const totalTimeSpentDesc = getHrMinString(totalTimeSpentInMins)


    return (
        isDataAllLoaded ? 
        <>
            
            <div className="screen-time-cnt">

                {
                    toastMsg ?
                    <PopupToast
                        key={'popup-toast'}
                        toastData={toastData}
                        setToastData={setToastData}
                    /> : null
                }
                {
                    showSitesTimeLimitScreen ?
                    <PopupFull 
                        setClosePopup={()=> {
                            setShowSitesTimeLimitScreen(false)
                        }}
                    >
                        <SiteTimeLimitScreen 
                            showTimeLimitInput={(hostname)=> setShowTimeLimitInput(hostname)}
                            toastMsg={toastMsg}
                            setClosePopup={()=> setShowSitesTimeLimitScreen(false)}
                            screenTimeLimit={screenTimeLimit}
                        > 
                            {
                                showTimeLimitInput ?
                                <TimeLimitInput 
                                    showTimeLimitInput={showTimeLimitInput}
                                    setShowTimeLimitInput={setShowTimeLimitInput}
                                    setToastData={setToastData}
                                    setScreenTimeLimit={setScreenTimeLimit}
                                    setClosePopup={()=>setShowTimeLimitInput(false)}
                                /> : null
                            }
                        
                        </SiteTimeLimitScreen >
                    </PopupFull> : 
                    showTimeLimitInput ?
                    <TimeLimitInput 
                        showTimeLimitInput={showTimeLimitInput}
                        setShowTimeLimitInput={setShowTimeLimitInput}
                        setToastData={setToastData}
                        setScreenTimeLimit={setScreenTimeLimit}
                        setClosePopup={()=>setShowTimeLimitInput(false)}
                    />  :
                    null
                }
                <div className='set-screen-time-btn-cnt'
                    onClick={()=>{

                        setShowSitesTimeLimitScreen(true)
                    }}
                >
                    <p className="icon">
                        <MdSettingsSuggest />
                    </p>
                    <p className="desc">
                        Set Screen Time Limit
                    </p>
                </div>
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
                        <SiteList 
                            dayScreenTimeTracker={dayScreenTimeTracker}
                            dayNoOfVisitsTracker={dayNoOfVisitsTracker}
                            setShowTimeLimitInput={setShowTimeLimitInput}
                            screenTimeLimit={screenTimeLimit}
                            setToastData={setToastData}
                        />
                    </ul>
                </div>
            </div>

        </> :
        <Loader />
    )
}

const SiteList = ({dayScreenTimeTracker, dayNoOfVisitsTracker, setShowTimeLimitInput, screenTimeLimit, setToastData})=>{
    const dayScreenTimeTrackerArr = Object.entries(dayScreenTimeTracker)
    
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
    for (const [site, minutesSpent] of dayScreenTimeTrackerArr){
        const visitTimesDesc = dayNoOfVisitsTracker[site] ? `• ${dayNoOfVisitsTracker[site]} visits` : ''

        const [screenTimeLimitHrs, screenTimeLimitMinutes] = screenTimeLimit?.[site] ?? [0, 0]
        const isTimeLimitExceeded = screenTimeLimit?.[site] && minutesSpent > ((screenTimeLimitHrs*60) + screenTimeLimitMinutes)

        const item = (
            <li className='site-list-item'
                key={site}
            >
                <div className="site-list-item-details">
                    <img className='site-item-icon' src={`http://www.google.com/s2/favicons?domain=${site}&sz=${128}`} alt="icon" />
                    <div className="site-item-info">
                        <p className='site-item-name'>{site}</p>
                        <p className='site-item-screen-time'>{`${getHrMinString(minutesSpent)} ${visitTimesDesc}`}</p>
                    </div>
                </div>
                <div 
                    className="time-limit-cnt"
                    onClick={()=>{
                        setToastData([null, null])
                        setShowTimeLimitInput(site)
                    }}
                
                >
                    <div className={`time-limit-inner-cnt ${isTimeLimitExceeded ? 'time-limit-exceeded' : ''}`}>
                        {
                            screenTimeLimit?.[site] ?
                            <FaHourglass /> :
                            <FaRegHourglass /> 
                        }
                        {   
                            screenTimeLimit?.[site] ?
                            <div className={`time-limit-text`}>
                                {
                                    getTimeShowText(screenTimeLimit[site])
                                }
                            </div> :
                            null
                        }
                    </div>
                </div>
            </li>
        )
        siteListArr.push(item)
    }

    return (
        <>
            {siteListArr}
        </> 
    )
}
export default ScreenTime

function FloatingBtn({setShowSitesTimeLimitScreen}){
    return (
        <div className='floating-btn'
            title='set screen time'
            onClick={()=>{
                setShowSitesTimeLimitScreen(true)
            }}
        >
            <GiHamburgerMenu />
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
    let timeSpentInMinutes = 0
    for (const site in dayScreenTimeTracker){
        const secondsSpent = dayScreenTimeTracker[site]
        timeSpentInMinutes+=secondsSpent
    }
    return  Math.round(timeSpentInMinutes)

}


const getTimeShowText  = ([hours, minutes]) => {
    let text = ''
    if (hours > 0){
        text += `${hours}h `
    }

    if (minutes > 0){
        text += `${minutes}m`
    }
    return text

}

