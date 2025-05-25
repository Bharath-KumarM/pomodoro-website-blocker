import { useContext, useEffect, useState } from "react"

import {ImCheckboxUnchecked as BlockIcon} from "react-icons/im"
import {SlFire as FireIcon} from "react-icons/sl"
import {BiInfoCircle as InfoIcon} from "react-icons/bi"

import SiteInfoCard from "./SiteInfoCard"
import { getCurrTab } from "../../../utilities/chrome-tools/chromeApiTools"

import "./Dashboard.scss"

import { PopupFull, PopupToast } from "../../../utilities/PopupScreens"

import { getLocalBlockedScreenDataByTabId } from '../../../localStorage/localBlockedScreenData'
import { getLocalRestrictedScreenDataByTabId } from '../../../localStorage/localRestrictedScreenData'
import { getLocalTimeLimitScreenDataByTabId } from '../../../localStorage/localTimeLimitScreenData'
import { checkSiteTagging, getScreenTimeLimit, handleBlockUnblockSite } from "../../../localStorage/localSiteTagging"
import { getLocalSettingsData } from "../../../localStorage/localSettingsData"
import PopupScreenTime from "./PopupScreenTime"
import { LocalFavIconUrlDataContext } from "../../context"
import { getFavIconUrlFromGoogleApi } from "../../../utilities/simpleTools"

// In popup screen, it creates the UI to block current website.
const Dashboard = ()=>{
    const [currTab, setCurrTab] = useState(null)

    const [isBlocked, setIsBlocked] = useState(null)
    const [isSiteIgnored, setIsSiteIgnored] = useState(false)

    const [popupScreenData, setPopupScreenData] = useState(false)

    const [toastData, setToastData] = useState([]) //* Toast Message from bottom

    const handleComponentMount = async ()=>{
        // *Get Current tab opened by user
        let tempCurrTab = await getCurrTab()
        if (!tempCurrTab){
            setCurrTab({hostname: null, favIconUrl: null, url: null})
            return null
        }

        let url = tempCurrTab.url
        let urlPathname = (new URL(url)).pathname
        let hostname = (new URL(url)).hostname
        let favIconUrl = tempCurrTab.favIconUrl

        tempCurrTab.hostname = hostname 

        // *If the current tab is blocked and blocked screen is loaded, then get the site details from local storage
        if (urlPathname === '/src/pages/blocked-screen/blocked-screen.html'){
            const blockedScreenDataOfCurrTab = await getLocalBlockedScreenDataByTabId(tempCurrTab.id)
            if (!blockedScreenDataOfCurrTab) {
                return
            }

            [hostname, favIconUrl, url] = blockedScreenDataOfCurrTab
            tempCurrTab = {hostname, favIconUrl, url}
        }
        if (urlPathname === '/src/pages/restricted-screen/restricted-screen.html'){
            const restrictedScreenDataOfCurrTab = await getLocalRestrictedScreenDataByTabId(tempCurrTab.id)
            console.log({restrictedScreenDataOfCurrTab})
            if (!restrictedScreenDataOfCurrTab) {
                return
            }

            [hostname, favIconUrl, url]= restrictedScreenDataOfCurrTab
            tempCurrTab = {hostname, favIconUrl, url}
        }
        if (urlPathname === '/src/pages/time-limit-screen/time-limit-screen.html'){
            const timeLimitScreenDataOfCurrTab = await getLocalTimeLimitScreenDataByTabId(tempCurrTab.id)
            if (!timeLimitScreenDataOfCurrTab) {
                return
            }

            [hostname, favIconUrl, url] = timeLimitScreenDataOfCurrTab
            tempCurrTab = {hostname, favIconUrl, url}
        }


        const ignoreSites = await getLocalSettingsData({key: 'ignore-sites'})
        if (ignoreSites.includes(hostname)){
            setIsSiteIgnored(true)
        }

        // const tempIsBlocked  = await checkLocalBlockedSitesByHostname(hostname)
        const tempIsBlocked = await checkSiteTagging({hostname, checkBlockedSite: true})

        const screenTime = await getScreenTimeLimit()

        setCurrTab(tempCurrTab)
        setIsBlocked(tempIsBlocked)
        // setPopupScreenData({hostname, isScreenTimeHovered: true})


    }
    useEffect( ()=>{
        handleComponentMount()
    }, [])

    // *waits for current tab details
    if (!currTab) return <div>Loading...</div>

    const [toastMsg, toasColorCode] = toastData

    const isValidWebpage = Boolean(currTab.url) && currTab.url.startsWith('http')

    let invalidSiteMessage = null
    if (isValidWebpage === false){
        invalidSiteMessage = 'This site cannot be blocked'
    }

    if (isSiteIgnored === true){
        invalidSiteMessage = 'This site is ignored by you, check ⚙️settings option.'
    }
    
    const hostname = currTab.url ? (new URL(currTab.url)).hostname : currTab.hostname // todo: what does it do?
    const handleBlockBtnClick = async ()=>{
        const shouldBlockSite = !isBlocked
        await handleBlockUnblockSite({hostname, shouldBlockSite , setToastData})

        setIsBlocked(shouldBlockSite)
        
        window.close()
    }
    return (
        <>
            {
                toastMsg ? 
                <PopupToast 
                    key={'popup-toast'}
                    toastData={toastData}
                    setToastData={setToastData}
                /> : null 
            }
                        {
                popupScreenData && 
                <PopupFull 
                    setClosePopup={()=>setPopupScreenData(null)}
                
                >   
                    {
                        popupScreenData.isOpenTimesHovered ? 
                        <div> Opens </div> :
                        popupScreenData.isScreenTimeHovered ?
                        <PopupScreenTime 
                            hostname={popupScreenData.hostname}
                        /> : null
                    }
                </PopupFull> 
            }  
            <LoadingImg 
                favIconUrl={currTab.favIconUrl}
            />
            <div className='block-site-cnt'>
                {
                    invalidSiteMessage ? 
                    <InvalidSiteDetails 
                        message={invalidSiteMessage}
                    /> : 
                    <SiteDetails  // Shows Current site info(like blocked or not and screen time) 
                        isBlocked={isBlocked}
                        currTab={currTab}
                        handleBlockBtnClick={handleBlockBtnClick} 
                        setPopupScreenData={setPopupScreenData}
                    />
                }
            </div>
        </>
    )
}



function SiteDetails({isBlocked, currTab, handleBlockBtnClick, setPopupScreenData}){
    const [count , setCount] = useState(30) // wait time to unblock site
    const localFavIconUrlData = useContext(LocalFavIconUrlDataContext)
    const getFavIcon = (hostname)=>{
        return localFavIconUrlData[hostname] || getFavIconUrlFromGoogleApi(hostname)
    }

    useEffect(()=>{
        if (isBlocked && count > 0){
            setTimeout(()=>{
                setCount((prevCount)=>prevCount-1)
            }, 1000)
        }
    }, [count, isBlocked])

    const {hostname, favIconUrl, url } = currTab
    return (
        <div className="content">
            <div 
                className={"icon-cnt " + (isBlocked ? "block" : " ")}
            >
                <div className="icon">
                    <img 
                        src={getFavIcon(hostname)} 
                        alt="icon" 
                        className={isBlocked ? 'block' : null}
                    />
                </div>
            </div>
            <div className= { 'host-name ' + (isBlocked ? 'blocked' : '')}>
                {hostname}
            </div>
            <SiteInfoCard 
                hostname={hostname}
                setPopupScreenData={setPopupScreenData}
            />
            <button 
                className={'btn '}
                onClick={()=>{
                    if (!isBlocked || count <= 0){
                        handleBlockBtnClick(isBlocked)
                    }
                }}
            >
                {   
                    isBlocked === null ? 'Loading...' :
                    isBlocked === true &&  count > 0 ? `Wait for ${count} sec` :
                    isBlocked === true ? 'Unblock this site' :
                    isBlocked === false ? 'Block this site' : null
                }
            </button>
        </div>  
    )
}
function InvalidSiteDetails({message}){

    return (
    <div className="content">
        <div 
            className={"icon-cnt "}>
            <div className="icon">
                <BlockIcon />
            </div>
        </div>
        <div className="invalid-site-bg">
            <FireIcon />
        </div>
        <div className="invalid-site-msg">
            <div className="icon">
                <InfoIcon />
            </div>
            <h3>
                {message}
            </h3>
        </div>
    </div>  
    // This site cannot be blocked 
    )
}

const LoadingImg = ({favIconUrl}) => {
    const [show, setShow] = useState(true)
    if (!favIconUrl || !show){
        return null
    }

    return (
    <div class='loading-bg flex-center'
        onAnimationEnd={()=>{
            setShow(false)
        }}
    >
        <div className="loading-cnt">
            <img className="loading-img"
                src={favIconUrl} 
                alt="tab_fav_icon" 
            />
        </div>
    </div>
    )
}
export default Dashboard