import "./SiteInfoCard.scss"

import {AiOutlineSwap as SwapIcon} from "react-icons/ai"
import { useState } from "react"


const SiteInfoCard = ({hostname}) =>{
    const [isScreenTime, setIsScreenTime] = useState(true)
    return (
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
                {isScreenTime ? "2hr 10min, Today" : "10 times, Today"}
            </div>
        </div>
    )
}

export default SiteInfoCard