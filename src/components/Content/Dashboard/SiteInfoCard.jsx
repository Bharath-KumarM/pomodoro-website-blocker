import "./SiteInfoCard2.scss"
import "./SiteInfoCard.scss"

import { IoMdSwap as  SwapIcon} from "react-icons/io"
import { useEffect, useState } from "react"
import { getDateString } from "../../../utilities/date"
import { getLocalScreenTimeTrackerForDayByHostname } from "../../../localStorage/localScreenTimeTracker"
import { getLocalVisitTrackerForDayByHostname } from "../../../localStorage/localVisitTracker"


const SiteInfoCard = ({hostname, setPopupScreenData}) => {
    const [screenTime, setScreenTime] = useState(0)
    const [openTimes, setOpenTimes] = useState(0)

    useEffect(()=>{
        const getData = async ()=>{
            const dateString = getDateString(0)
    
            const noOfVisit = await getLocalVisitTrackerForDayByHostname(hostname, dateString)
            const screenTimeInMinutes = await getLocalScreenTimeTrackerForDayByHostname(dateString, hostname)
            
            setScreenTime(screenTimeInMinutes)
            setOpenTimes(noOfVisit)
        }

        getData()
    }, [])

    return (
        <div className="site-info-card-cnt">
            <div className="quarter-cnt fist"
                onMouseEnter={()=>{
                    setPopupScreenData({hostname, isScreenTimeHovered: true})
                }}
            >
                <div className="bar value">
                    {`${getTimeFormat(screenTime)}`}
                </div>
                <hr className="line"/>
                <div className="bar title">
                    Screen time
                </div>
            </div>
            <div className="quarter-cnt second"
                onMouseEnter={()=>{
                    setPopupScreenData({hostname, isOpenTimesHovered: true})
                }}
            >
                <div className="bar value">
                    {`${openTimes} times`}
                </div>
                <hr className="line"/>
                <div className="bar title">
                    Opens
                </div>
            </div>
            {/* <div className="quarter-cnt third">
                <div className="bar value">
                    Yes
                </div>
                <hr className="line"/>
                <div className="bar title">
                    📵Distracted
                </div>
            </div>
            <div className="quarter-cnt fourth">
                <div className="bar value">
                    Not set
                </div>
                <hr className="line"/>
                <div className="bar title">
                    ⏳Time limit
                </div>
            </div> */}
        </div>
    )
}

const SiteInfoCard2 = ({hostname}) =>{
    const [screenTime, setScreenTime] = useState(null)
    const [noOfVisit, setNoOfVisit] = useState(null)

    const getInfo = async ()=>{
        const dateString = getDateString(0)
    
        const noOfVisit = await getLocalVisitTrackerForDayByHostname(hostname, dateString)
        const screenTimeInMinutes = await getLocalScreenTimeTrackerForDayByHostname(dateString, hostname)
        
        setScreenTime(screenTimeInMinutes)
        setNoOfVisit(noOfVisit)
    }

    useEffect(()=>{
        getInfo()
    }, [])
    return (
        <>
        {            
            screenTime === null ?  
            null
            :
            <div 
                className="site-info-cnt flip-card" 
                >
                
                <div className="flip-card-inner">
                    <div className="flip-card-front">
                        <div className="swap-icon-cnt">
                            <SwapIcon />
                        </div>
                        <div className="site-info-title">
                            {`${getTimeFormat(screenTime)}`}
                        </div>
                        <hr className="site-info-line" />
                        <div className="site-info-data">
                            Screen Time
                        </div>
                    </div>
                    <div className="flip-card-back">
                        <div className="swap-icon-cnt">
                            <SwapIcon />
                        </div>
                        <div className="site-info-title">
                            {`${noOfVisit} times`}
                        </div>
                        <hr className="site-info-line" />
                        <div className="site-info-data">
                            No. of visits
                        </div>
                    </div>
                </div>
            </div>
        }
        </>
    )
}

export default SiteInfoCard


const getTimeFormat = (timeInMinutes)=>{
    // const hr = ("0"+parseInt(timeInMinutes/60)).slice(-2)
    const hr = parseInt(timeInMinutes/60)

    if (hr > 0){
        return `${hr}hr ${timeInMinutes%60}m`
    }else{
        return `${timeInMinutes%60} min`
    }
    
}

