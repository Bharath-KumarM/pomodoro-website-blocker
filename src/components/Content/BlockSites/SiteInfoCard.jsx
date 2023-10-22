import "./SiteInfoCard.scss"

import { IoMdSwap as  SwapIcon} from "react-icons/io"
import { useEffect, useState } from "react"
import { getDateString } from "../../../utilities/date"
import { getLocalScreenTimeTrackerForDayByHostname } from "../../../localStorage/localScreenTimeTracker"
import { getLocalVisitTrackerForDayByHostname } from "../../../localStorage/localVisitTracker"



const SiteInfoCard = ({hostname}) =>{
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
                
                <div class="flip-card-inner">
                    <div class="flip-card-front">
                        <div className="swap-icon-cnt">
                            <SwapIcon />
                        </div>
                        <div className="site-info-title">
                            Screen Time
                        </div>
                        <hr className="site-info-line" />
                        <div className="site-info-data">
                            {`${getTimeFormat(screenTime)}, Today`}
                        </div>
                    </div>
                    <div class="flip-card-back">
                        <div className="swap-icon-cnt">
                            <SwapIcon />
                        </div>
                        <div className="site-info-title">
                            No. of visits
                        </div>
                        <hr className="site-info-line" />
                        <div className="site-info-data">
                            {`${noOfVisit} times, Today`}
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


    return `${hr === 0 ? '' : hr+'hr '}${timeInMinutes%60}min`
}