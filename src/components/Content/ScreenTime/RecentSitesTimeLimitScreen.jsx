import { useEffect, useRef, useState } from 'react'
import './RecentSiteTimeLimitScreen.scss'
import { getRecentHostnames } from '../../../utilities/chrome-tools/chromeApiTools'

import { FaHourglass, FaRegHourglass, FaHourglassHalf } from "react-icons/fa";
import { GrCircleInformation } from "react-icons/gr";
import { MdClose } from "react-icons/md";
import { getFavIconUrlFromGoogleApi, getHost, isValidUrl } from '../../../utilities/simpleTools';
import { getScreenTimeLimit } from '../../../localStorage/localSiteTagging';
import EditTimeLimit from './EditTimeLimit';
import { LocalFavIconUrlDataContext } from '../../context';

const RecentSitesTimeLimitScreen = ({setClosePopup, setToastData})=>{
    const [recentSites, setRecentSites] = useState(null)
    const [screenTimeLimit, setScreenTimeLimit] = useState(null)
    const [searchText, setSearchText] = useState('')
    const [showTimeLimitInput, setShowTimeLimitInput] = useState(null)

    const localFavIconUrlData = useContext(LocalFavIconUrlDataContext)
    const getFavIcon = (hostname)=>{
        return localFavIconUrlData[hostname] || getFavIconUrlFromGoogleApi(hostname)
    }

    useEffect(()=>{
        const getData = async () => {
            setRecentSites(await getRecentHostnames())
            setScreenTimeLimit(await getScreenTimeLimit())
        }

        getData()
    }, [])

    if (recentSites === null || screenTimeLimit === null) {
        return <div>Loading...</div>
    }
    
    const screenTimeLimitSitesArr = Object.keys(screenTimeLimit && {})
    const allUniqueSites = removeDuplicatesInArr([...screenTimeLimitSitesArr, ...recentSites])

    const sitesSearchFiltered = allUniqueSites.filter((site)=> searchText === '' || site.search(searchText) > 0 )

    const sitesWithScreenTime = sitesSearchFiltered.map((hostname)=> {
        return [hostname, getTotalTimeInMin(screenTimeLimit?.[hostname] ?? [0, 0])];
    })


    sitesWithScreenTime.sort( (a, b)=> -a[1] + b[1] )

    let isSearchTextValidSite = false
    let  hostname
    if (isValidUrl(searchText)){
        const searchTextAsHostname = getHost(searchText)
        hostname = searchTextAsHostname
        isSearchTextValidSite = sitesWithScreenTime.includes(searchTextAsHostname) !== true
    }

    return (
        <>
            {
                showTimeLimitInput ?
                <EditTimeLimit 
                    hostname={showTimeLimitInput}
                    setShowTimeLimitInput={setShowTimeLimitInput}
                    setToastData={setToastData}
                    setScreenTimeLimit={setScreenTimeLimit}
                    setClosePopup={()=>setShowTimeLimitInput(null)}
                /> : null
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
                        {   
                            isSearchTextValidSite ?
                            <li className='site-item'>
                                <div className="cnt">
                                    <img className='site-item-icon' 
                                        src={getFavIcon(getHost(searchText))} 
                                        alt="icon" 
                                    />
                                    <span className='hostname'>
                                        {getHost(searchText)}
                                    </span>    
                                </div>
                                <div className='icon-btn'
                                    onClick={()=> {
                                        setShowTimeLimitInput(getHost(searchText))
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
                            sitesWithScreenTime.length > 0 ?
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
                            sitesWithScreenTime.map(([hostname, timeLimit])=>{
                                
                                return (
                                    <li className='site-item'
                                        key={hostname}
                                    >
                                        <div className="cnt">
                                            <img className='site-item-icon' 
                                                src={getFavIcon(hostname)} 
                                                alt={hostname}
                                            />
                                            <span className='hostname'>
                                                {hostname}
                                            </span>    
                                        </div>
                                        <div className='icon-btn'
                                            onClick={()=> {
                                                setShowTimeLimitInput(hostname)
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

export default RecentSitesTimeLimitScreen


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

const removeDuplicatesInArr = (arr) => [...new Set(arr)]