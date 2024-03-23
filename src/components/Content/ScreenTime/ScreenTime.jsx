import "./ScreenTime.scss";

import { FaHourglass, FaRegHourglass } from "react-icons/fa";
import { AiOutlineLeft as LeftArrowIcon} from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import { MdSettingsSuggest } from "react-icons/md";
import { AiOutlineRight as RightArrowIcon} from "react-icons/ai";
import { IoMdArrowRoundBack } from "react-icons/io";
import { IoMdArrowDropdown } from "react-icons/io";

import { useContext, useEffect, useState } from 'react';

import { getDateString, getDayNumber, getFullDate, getHrMinString } from '../../../utilities/date';

import { PopupFull, PopupToast } from '../../../utilities/PopupScreens';
import EditTimeLimit from './EditTimeLimit';
import RecentSitesTimeLimitScreen from './RecentSitesTimeLimitScreen';

import { getLocalScreenTimeTracker } from '../../../localStorage/localScreenTimeTracker';
import { getLocalVisitTracker, getLocalVisitTrackerForDay } from '../../../localStorage/localVisitTracker';
import { getScreenTimeLimit } from '../../../localStorage/localSiteTagging';

import Loader from '../../../utilities/Loader';
import NavBar from '../NavBar/NavBar';
import Graph from './Graph';
import { ContentScrollCntEleRefContext, LocalFavIconUrlDataContext } from "../../context";
import { getFavIconUrlFromGoogleApi } from "../../../utilities/simpleTools";
import { getRecentHostnames } from "../../../utilities/chrome-tools/chromeApiTools";




const ScreenTime = ({setNavSelect, scrollCntEleRef})=>{
    const [toastData, setToastData] = useState([null, null]) //* Toast Message from bottom

    const [day, setDay] = useState(0)
    const [data, setData] = useState(null)

    const [dataType, setDataType] = useState('screen-time') // 'screen-time' || 'opens'

    const [showEditTimeLimit, setShowEditTimeLimit] = useState(null) 
    const [showSitesTimeLimitPopupScreen, setShowSitesTimeLimitPopupScreen] = useState(null)

    const [screenTimeLimit, setScreenTimeLimit] = useState(null)
    const [specificSite, setspecificSite] = useState(null)

    const [searchText, setSearchText] = useState('')


    const localFavIconUrlData = useContext(LocalFavIconUrlDataContext)
    const scrollCntEleRefContext = useContext(ContentScrollCntEleRefContext)



    const getFavIcon = (hostname)=>{
        return localFavIconUrlData[hostname] || getFavIconUrlFromGoogleApi(hostname)
    }


    useEffect(()=>{
        const getScreenTimeLimitData = async ()=>{
            setScreenTimeLimit(await getScreenTimeLimit())
        }

        getScreenTimeLimitData()
    }, [])
    
    useEffect(()=>{
        // setspecificSite(null)
        getData(day)
    },[day, specificSite, dataType])

    const getData = async (day)=>{
        let screenTimeTracker = await getLocalScreenTimeTracker()

        let visitTracker = await  getLocalVisitTracker()

        const dateString = getDateString(day)
        const fullDate = getFullDate(day)
        
        const dayNumOfWeek = getDayNumber(day)
        const weeklyData = []

        // data for Graph
        const weekStartDay = day-dayNumOfWeek
        for (let i=weekStartDay; i<7+weekStartDay; i++){
            const tempDateString = getDateString(i)

            if (dataType === 'screen-time'){
                const dayScreenTimeTracker = screenTimeTracker[tempDateString]
                const totalTimeSpentInSec = getTotalTimeFromTracker({dayScreenTimeTracker, specificSite})
    
                weeklyData.push(totalTimeSpentInSec)

            } else if (dataType === 'opens'){
                const dayVisitTracker = visitTracker[tempDateString]
                const totalOpens = getTotalOpensFromTracker({dayVisitTracker, specificSite})
    
                weeklyData.push(totalOpens)
                
            }
        }

        const dayScreenTimeTracker = screenTimeTracker[dateString] ? screenTimeTracker[dateString] : {}
        const dayVisitTracker = visitTracker[dateString] ? visitTracker[dateString] : {}
        const dayNoOfVisitsTracker = await getLocalVisitTrackerForDay(dateString)

        setData({dayScreenTimeTracker, dayVisitTracker, fullDate, weeklyData, dayNoOfVisitsTracker})
    }



    
    if (data === null) {
        return <Loader/>
    }
        
    const [toastMsg, toastColorCode] = toastData

    const {dayScreenTimeTracker, dayVisitTracker, fullDate, weeklyData, dayNoOfVisitsTracker} = data;

    const totalTimeSpentInMins = getTotalTimeFromTracker({dayScreenTimeTracker, specificSite})
    const totalTimeSpentDesc = getHrMinString(totalTimeSpentInMins)

    const totalOpens = getTotalOpensFromTracker({dayVisitTracker, specificSite})
    const totalOpensDesc = 'Opened ' + totalOpens + ' times'

    const navDetailsArr = [['Screen time', () => setspecificSite(null)]]
    specificSite && navDetailsArr.push([specificSite])



    return (
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
        <NavBar 
            setNavSelect={setNavSelect}
            navDetailsArr={navDetailsArr}
        />
        {
            showSitesTimeLimitPopupScreen ?
            <PopupFull 
                setClosePopup={()=> setShowSitesTimeLimitPopupScreen(null)}
            >
                <RecentSitesTimeLimitScreen 
                    setClosePopup={()=> setShowSitesTimeLimitPopupScreen(null)}
                    setToastData={setToastData}
                /> 
            </PopupFull> : 
            showEditTimeLimit ?
            <EditTimeLimit 
                hostname={showEditTimeLimit}
                setToastData={setToastData}
                setScreenTimeLimit={setScreenTimeLimit}
                setClosePopup={()=>setShowEditTimeLimit(null)}
            />  :
            null
        }
        {
            specificSite ? 
            <button className="specific-site-back-btn"
                onClick={()=>setspecificSite(null)}
            >
                <IoMdArrowRoundBack />
            </button> : null
        }
        {
            specificSite  ?  
            <div className="icon-cnt ">
                <div className="icon">
                    <img 
                        src={getFavIcon(specificSite)} 
                        alt="icon" 
                    />
                </div>
                <div className="icon-site">
                    {specificSite}
                </div>
            </div> : null
            // !debug
            // <div className='set-screen-time-btn-cnt'
            //     onClick={()=>setShowSitesTimeLimitPopupScreen(true)}
            // >
            //     <p className="icon">
            //         <MdSettingsSuggest />
            //     </p>
            //     <p className="desc">
            //         Set Screen Time Limit
            //     </p>
            // </div>
        }
        <div className="screen-time-details-cnt">
            <div className="screen-time-detail">
                <div className="desc">
                    {dataType === 'opens' ? totalOpensDesc : totalTimeSpentDesc}
                </div>

                <div className="drop-down-icon">
                    <IoMdArrowDropdown />
                </div>
                <ul className="option-cnt">
                    {
                        dataType !== 'screen-time' && 
                        <li
                            onClick={()=>setDataType('screen-time')}
                        >
                            Show screen time
                        </li>
                    }
                    {
                        dataType !== 'opens' && 
                        <li
                            onClick={()=>setDataType('opens')}
                        >
                            Show opened count
                        </li>
                    }
                </ul>
            </div>


            <p className="screen-time-day"
                onClick={()=>setDay(0)}
            >
                {getDayAgo(day)}
            </p>
        </div>
        <Graph 
            weeklyData={weeklyData}
            dataType={dataType}
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
                className={`day-arrow right ${day < 0 ? '' : 'inactive'}`}
                onClick={()=>{
                    if (day < 0){
                        setDay(prevDay => prevDay+1)
                    }
                }}
            >
                <RightArrowIcon />
            </button>
        </div>
        <SiteList 
            dayScreenTimeTracker={dayScreenTimeTracker}
            dayNoOfVisitsTracker={dayNoOfVisitsTracker}
            setShowEditTimeLimit={setShowEditTimeLimit}
            screenTimeLimit={screenTimeLimit}
            setToastData={setToastData}
            setspecificSite={setspecificSite}
            scrollCntEleRefContext={scrollCntEleRefContext}
            searchText={searchText}
        />
    
    </div>
    <input 
        type="text" 
        className="recent-sites-search" 
        placeholder={'Search sites🔍'}
        onChange={(e)=>setSearchText(e.target.value.toLocaleLowerCase())}
        onFocus={()=>{
            scrollCntEleRefContext.current.scrollTo(0, 275)
        }}
        
    />
</>
    )
}

const SiteList = ({dayScreenTimeTracker, dayNoOfVisitsTracker, setShowEditTimeLimit, screenTimeLimit, setToastData, setspecificSite, searchText, })=>{
    const [recentSites, setRecentSites] = useState([])
    const [showRecentSites, setShowRecentSites] = useState(false)

    const contentScrollCntEleRef = useContext(ContentScrollCntEleRefContext)

    useEffect(()=>{
        if (searchText !== ''){
            setShowRecentSites(true)
        }
    }, [searchText])


    useEffect(()=>{
        const getData = async () => {
            const tempRecentSites =  await getRecentHostnames()
            setRecentSites(tempRecentSites)
        }

        getData()

    }, [])

    const openedSites = Object.keys(dayScreenTimeTracker)
    const recentSitesNotOpened = recentSites
        .filter((recentSite) => !openedSites.includes(recentSite))
        .filter(site=> !searchText || site.includes(searchText))


    const dayScreenTimeTrackerArr = Object.entries(dayScreenTimeTracker)
        .filter(([site, minutesSpent]) => !searchText || site.includes(searchText))

    const localFavIconUrlData = useContext(LocalFavIconUrlDataContext)
    const getFavIcon = (hostname)=>{
        return localFavIconUrlData[hostname] || getFavIconUrlFromGoogleApi(hostname)
    }
    

    dayScreenTimeTrackerArr.sort(([siteA, minutesSpentA], [siteB, minutesSpentB])=> minutesSpentB[1]-minutesSpentA[1])

    const siteListArr = []
    for (const [site, minutesSpent] of dayScreenTimeTrackerArr){
        const visitTimesDesc = `• ${dayNoOfVisitsTracker[site] ?? 0} Opens` 

        const [screenTimeLimitHrs, screenTimeLimitMinutes] = screenTimeLimit?.[site] ?? [0, 0]
        const isTimeLimitExceeded = screenTimeLimit?.[site] && minutesSpent > ((screenTimeLimitHrs*60) + screenTimeLimitMinutes)

        const item = (
            <li className='site-list-item'
                key={site}
            >
                <div className="site-list-item-details"
                    onClick={() => {
                        contentScrollCntEleRef.current.scrollTo(0, 0)
                        setspecificSite(site)
                    }}
                >
                    <img className='site-item-icon' src={getFavIcon(site)} alt="icon" />
                    <div className="site-item-info">
                        <p className='site-item-name'>{site}</p>
                        <p className='site-item-screen-time'>{`${getHrMinString(minutesSpent)} ${visitTimesDesc}`}</p>
                    </div>
                </div>
                <div 
                    className="time-limit-cnt"
                    onClick={()=>{
                        setToastData([null, null])
                        setShowEditTimeLimit(site)
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
            <div className="site-list-cnt">

                    
                <ul className='site-list'> 
                    {siteListArr} 
                </ul> 
                {   showRecentSites ?
                    <>
                        {
                            recentSitesNotOpened.length > 0 ?
                            <>
                                <div className="recent-site-list-heading">
                                    All sites
                                </div>
                                <ul className='site-list'> 
                                    {
                                        recentSitesNotOpened.map((site)=>{
                                            return (
                                                <RecentSiteItem 
                                                    key={site}
                                                    site={site}
                                                    setspecificSite={setspecificSite}
                                                    setToastData={setToastData}
                                                    setShowEditTimeLimit={setShowEditTimeLimit}
                                                    screenTimeLimit={screenTimeLimit}
                                                    getFavIcon={getFavIcon}
                                    
                                                />
                                            )
                                        })
                                    }
                                </ul> 
                            </> : null
                        }
                    </> : 
                    <div className="show-recent-site"
                            onClick={()=>{
                                contentScrollCntEleRef.current.scrollTo(0, 0)
                                setShowRecentSites(true)
                            }}
                    >
                        <span>
                            Show all sites
                        </span>

                        <IoMdArrowDropdown />

                    </div>
                }
            </div>
        </>
    )
}
export default ScreenTime


function RecentSiteItem({site, setspecificSite, setToastData, setShowEditTimeLimit, screenTimeLimit,getFavIcon }){

    const isTimeLimitExceeded = false

    return (
    <li className='site-list-item'
        key={site}
    >
        <div className="site-list-item-details"
            onClick={() => {
                setspecificSite(site)
            }}
        >
            <img className='site-item-icon' src={getFavIcon(site)} alt="icon" />
            <div className="site-item-info">
                <p className='site-item-name'>{site}</p>
            </div>
        </div>
        <div 
            className="time-limit-cnt"
            onClick={()=>{
                setToastData([null, null])
                setShowEditTimeLimit(site)
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
}

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
const getTotalTimeFromTracker = ({dayScreenTimeTracker, specificSite})=>{
    if (!dayScreenTimeTracker){
        return 0
    }

    if (specificSite){
        const secondsSpent = dayScreenTimeTracker[specificSite]
        return  Math.round(secondsSpent)
    }

    let timeSpentInMinutes = 0

    for (const site in dayScreenTimeTracker){
        const secondsSpent = dayScreenTimeTracker[site]
        timeSpentInMinutes+=secondsSpent
    }
    return  Math.round(timeSpentInMinutes)

}

const getTotalOpensFromTracker = ({dayVisitTracker, specificSite}) => {
    if (!dayVisitTracker){
        return 'Never opened'
    }

    if (specificSite){
        const secondsSpent = dayVisitTracker[specificSite]
        return  secondsSpent ? Math.round(secondsSpent) : 0
    }

    let totalOpensCount = 0

    for (const site in dayVisitTracker){
        const openCount = dayVisitTracker[site]
        totalOpensCount+=openCount
    }
    return  Math.round(totalOpensCount)
}

const getTotalTimeOfScreenTimeLimit = (screenTimeLimitOfSite) => {
    if (!screenTimeLimitOfSite){
        return 0
    }
    const [hours, minutes] = screenTimeLimitOfSite

    return (hours*60) + minutes
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
