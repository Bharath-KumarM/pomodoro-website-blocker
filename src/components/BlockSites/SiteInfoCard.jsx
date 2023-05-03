import "./SiteInfoCard.scss"

import { IoMdSwap as  SwapIcon} from "react-icons/io"
import { useEffect, useState } from "react"
import { getDateString } from "../../utilities/date"


const SiteInfoCard = ({hostname}) =>{
    const [screenTime, setScreenTime] = useState(null)
    const [noOfVisit, setNoOfVisit] = useState(null)

    const getInfo = async ()=>{
        const dateString = getDateString(0)

        let {screenTimeTracker} = await chrome.storage.local.get('screenTimeTracker')
        let {noOfVisitsTracker} = await chrome.storage.local.get('noOfVisitsTracker')

        const screenTimeInMinutes = screenTimeTracker[dateString][hostname]
        const noOfVisit = noOfVisitsTracker[dateString][hostname][1]

        setScreenTime(screenTimeInMinutes ? Math.round(screenTimeInMinutes) : 0)
        setNoOfVisit(noOfVisit ? noOfVisit : 0)
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
                            No. of Opens
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