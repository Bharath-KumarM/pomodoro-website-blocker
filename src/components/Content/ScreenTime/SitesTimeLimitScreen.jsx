import { useEffect, useRef, useState } from 'react'
import './SiteTimeLimitScreen.scss'
import { getRecentHostnames } from '../../../utilities/chrome-tools/chromeApiTools'

import { FaHourglass, FaRegHourglass, FaHourglassHalf } from "react-icons/fa";
import { GrCircleInformation } from "react-icons/gr";
import { MdClose } from "react-icons/md";
import { getHost, isValidUrl } from '../../../utilities/simpleTools';

const SiteTimeLimitScreen = ({toastMsg, setClosePopup, showTimeLimitInput, screenTimeLimit, children})=>{
    const [recentSites, setRecentSites] = useState(null)
    const [searchText, setSearchText] = useState('')

    useEffect(()=>{
        getRecentHostnames().then((tempRecentSites)=>{
            setRecentSites(tempRecentSites)
        })
    }, [])

    if (recentSites === null) {
        return (
            <div>
                Loading...
            </div>
        )
    }
    
    let recentSitesFiltered = recentSites.filter((site)=> searchText === '' || site.search(searchText) > 0 )

    const recentSitesWithScreenTime = recentSitesFiltered.map((hostname)=> {
        return [hostname, getTotalTimeInMin(screenTimeLimit?.[hostname] ?? [0, 0])];
    })

    recentSitesWithScreenTime.sort( (a, b)=> -a[1] + b[1] )

    let isSearchTextValidSite = false
    if (isValidUrl(searchText)){
        const searchTextAsHostname = getHost(searchText)
        isSearchTextValidSite = recentSitesWithScreenTime.includes(searchTextAsHostname) !== true
    }

    return (
        <>
            {
                children
            }
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
                                autoFocus
                                type="text" 
                                placeholder='Search site or paste url'
                                value={searchText}
                                onChange={e=>{
                                        const typedValue = e.target.value.toLocaleLowerCase() 
                                        setSearchText(typedValue)
                                    }}
                            />
                        </div>
                    </div>
                    <ul className='site-cnt'>
                        {   isSearchTextValidSite ?
                            <li className='site-item'>
                                <div className="cnt">
                                    <img className='site-item-icon' 
                                        src={`http://www.google.com/s2/favicons?domain=${getHost(searchText)}&sz=${128}`} 
                                        alt="icon" 
                                    />
                                    <span className='hostname'>
                                        {getHost(searchText)}
                                    </span>    
                                </div>
                                <div className='icon-btn'
                                    onClick={()=> {
                                        showTimeLimitInput(getHost(searchText))
                                    }}

                                >
                                    <div className="time-limit-inner-cnt">
                                        {
                                            <FaRegHourglass /> 
                                        }
                                    </div>
                                </div>
                            </li> : null
                        }
                        {
                            recentSitesWithScreenTime.length > 0 ?
                            <li className='header-cnt'
                                key={'heading'}
                            >
                                <span className='icon'>
                                    <GrCircleInformation />
                                </span>
                                <span className='header'>
                                    Recently visited sites
                                </span>
                            </li> :
                            <li className='no-recent-site flex-center'
                                key={'no-recent-site'}
                            >
                                No recent sites
                            </li>

                        }
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
        </>
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