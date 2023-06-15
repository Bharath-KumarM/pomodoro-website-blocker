import { useEffect, useRef, useState } from 'react'
import './SiteTimeLimitScreen.scss'
import { getRecnetSitesFromNoOfVisitsTracker } from '../../utilities/chrome-tools/chromeApiTools'

import { FaHourglass, FaRegHourglass, FaHourglassHalf } from "react-icons/fa";
import { GrCircleInformation } from "react-icons/gr";
import { MdClose } from "react-icons/md";

const SiteTimeLimitScreen = ({toastMsg, setClosePopup, showTimeLimitInput, screenTimeLimit})=>{
    const [recentSites, setRecentSites] = useState([])
    const [recentSitesBackUp, setRecentSitesbackUp] = useState([])
    
    const searchBarRef = useRef(null)
    useEffect(()=>{
        getRecnetSitesFromNoOfVisitsTracker(-10).then((tempRecentSites)=>{
            setRecentSites(tempRecentSites)
            setRecentSitesbackUp(tempRecentSites)
        })
        searchBarRef.current.focus()
    }, [])

    const recentSitesWithScreenTime = recentSites.map((hostname)=> {
        return [hostname, getTotalTimeInMin(screenTimeLimit?.[hostname] ?? [0, 0])];
    })

    recentSitesWithScreenTime.sort( (a, b)=> -a[1] + b[1] )

    return (
    <div className='sites-time-limit-screen'
        onClick={(e)=>{
            e.stopPropagation()
        }}
    >
        <button className='close-btn flex-center'
            onClick={()=> setClosePopup()}
        >
            <MdClose />
        </button>
        <div className='inner-cnt'> 
            <div className="heading-cnt">

                <h3 className='heading'>
                    Time Limit Screen
                </h3>
                <div className="search-bar-cnt">
                    <input className='search-bar'
                        type="text" 
                        placeholder='Search site'
                        // value={userInput}
                        ref={searchBarRef}
                        onChange={e=>{
                                // setUserInput()
                                const typedValue = e.target.value.toLocaleUpperCase() 
                                if (typedValue){
                                    const tempRecentSites = []
                                    recentSitesWithScreenTime.map(( [hostname, timeLimit] )=> {
                                            if (hostname.toLocaleUpperCase().includes(typedValue)){
                                                tempRecentSites.push(hostname)
                                            }
                                        }
                                    )
                                    setRecentSites(tempRecentSites)
                                }
                                else{
                                    setRecentSites(recentSitesBackUp)
                                }
                            }}
                    />
                </div>
            </div>
            <ul className='site-cnt'>
                <li className='header-cnt'>
                    <span className='icon'>
                        <GrCircleInformation />
                    </span>
                    <span className='header'>
                        Suggesting recently visited sites
                    </span>
                </li>
                {
                    recentSitesWithScreenTime.map(([hostname, timeLimit])=>{
                        return (
                            <li className='site-item'>
                                <div className="cnt">
                                    <img className='site-item-icon' 
                                        src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} 
                                        alt="icon" 
                                    />
                                    <span className='hostname'>
                                        {hostname}
                                    </span>    
                                </div>
                                <div className='icon-btn'
                                    onClick={()=> {
                                        setClosePopup()
                                        showTimeLimitInput(hostname)
                                    }}

                                >
                                    <div className="time-limit-inner-cnt">
                                        {
                                            timeLimit ?
                                            <FaHourglass /> :
                                            <FaRegHourglass /> 
                                        }
                                        {   
                                            timeLimit ?
                                            <div className="time-limit-text">
                                                {
                                                    getTimeShowText(screenTimeLimit[hostname])
                                                }
                                            </div> :
                                            null
                                        }
                                    </div>
                                </div>
                            </li>
                        )
                    })
                }
            </ul>
        </div>
    </div>
    )
}

export default SiteTimeLimitScreen


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

const getTotalTimeInMin = ([hours, minutes]) => {
    return (hours * 60) + minutes
}