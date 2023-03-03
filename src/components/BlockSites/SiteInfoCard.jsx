import "./SiteInfoCard.scss"

import {AiOutlineSwap as SwapIcon} from "react-icons/ai"
import { useEffect, useState } from "react"
import { getDateString } from "../../utilities/date"


const SiteInfoCard = ({hostname}) =>{
    const [isScreenTime, setIsScreenTime] = useState(true)
    const [screenTime, setScreenTime] = useState(null)
    const [noOfVisit, setNoOfVisit] = useState(null)

    const getInfo = async ()=>{
        const dateString = getDateString(0)

        let {screenTimeTracker} = await chrome.storage.local.get('screenTimeTracker')
        let {noOfVisitsTracker} = await chrome.storage.local.get('noOfVisitsTracker')
        
        const screenTimeInMinutes = screenTimeTracker[dateString][hostname]
        const noOfVisit = noOfVisitsTracker[dateString][hostname]

        setScreenTime(screenTimeInMinutes ? screenTimeInMinutes : 0)
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
                className="site-info-cnt" 
                onClick={()=>{
                    setIsScreenTime((prevIsScreenTime)=>!prevIsScreenTime)
                }}
                >
                    <div className="swap-icon-cnt">
                        <SwapIcon />
                    </div>
                <div className="site-info-title">
                    {isScreenTime ? "Screen Time" : "No. of Visits"}
                </div>
                <hr className="site-info-line" />
                <div className="site-info-data">
                    {isScreenTime ? `${getTimeFormat(screenTime)}, Today` : `${noOfVisit} times, Today`}
                </div>
            </div>
        }
        </>
    )
}

export default SiteInfoCard


const getTimeFormat = (timeInMinutes)=>{
    const hr = ("0"+parseInt(timeInMinutes/60)).slice(-2)

    return `${hr === '00' ? '' : hr+'hr '}${timeInMinutes%60}min`
}