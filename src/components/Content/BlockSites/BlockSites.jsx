import { useEffect, useState } from "react"

import {ImCheckboxUnchecked as BlockIcon} from "react-icons/im"
import {SlFire as FireIcon} from "react-icons/sl"
import {BiInfoCircle as InfoIcon} from "react-icons/bi"

import BlockedSitesInfo from "./BlockedSitesInfo"
import SiteInfoCard from "./SiteInfoCard"
import { localLogMessage } from "../../../utilities/localStorageMsg"
import { getCurrTab } from "../../../utilities/chrome-tools/chromeApiTools"

import "./BlockSites.scss"
import { PopupToast } from "../../../utilities/PopupScreens"


import { getLocalBlockedScreenDataByTabId } from '../../../localStorage/localBlockedScreenData'
import { getLocalRestrictedScreenDataByTabId } from '../../../localStorage/localRestrictedScreenData'
import { getLocalTimeLimitScreenDataByTabId } from '../../../localStorage/localTimeLimitScreenData'
import { 
    checkLocalBlockedSitesByHostname,
    updateLocalBlockedSites, 
    delLocalBlockedSites, 
 } from '../../../localStorage/localBlockedSites'


// In popup screen, it creates the UI to block current website.
const BlockSites = ()=>{
    const [currTab, setCurrTab] = useState(null)
    const [isBlocked, setIsBlocked] = useState(null)
    const [toastData, setToastData] = useState([]) //* Toast Message from bottom


    const [toastMsg, toasColorCode] = toastData

    const handleComponentMount = async ()=>{
        // *Get Current tab opened by user
        let tempCurrTab = await getCurrTab()
        let urlPathname = (new URL(tempCurrTab.url)).pathname
        let hostname = (new URL(tempCurrTab.url)).hostname
        let favIconUrl = tempCurrTab.favIconUrl

        // *If the current tab is blocked and blocked screen is loaded, then get the site details from local storage
        if (urlPathname === '/src/pages/blocked-screen/blocked-screen.html'){
            const blockedScreenDataOfCurrTab = await getLocalBlockedScreenDataByTabId(tempCurrTab.id)
            if (!blockedScreenDataOfCurrTab) {
                localLogMessage("[-] @BlockedSite.jsx, blocked site's data is not found in local blockedScreenData ")
                return
            }

            [hostname, favIconUrl] = blockedScreenDataOfCurrTab
            tempCurrTab = {hostname, favIconUrl}
        }
        if (urlPathname === '/src/pages/restricted-screen/restricted-screen.html'){
            const restrictedScreenDataOfCurrTab = await getLocalRestrictedScreenDataByTabId(tempCurrTab.id)
            if (!restrictedScreenDataOfCurrTab) {
                localLogMessage("[-] @BlockedSite.jsx, restricted site's tab id is not found in restrictedScreenData ")
                return
            }

            [hostname, favIconUrl] = restrictedScreenDataOfCurrTab
            tempCurrTab = {hostname, favIconUrl}
        }
        if (urlPathname === '/src/pages/time-limit-screen/time-limit-screen.html'){
            const timeLimitScreenDataOfCurrTab = await getLocalTimeLimitScreenDataByTabId(tempCurrTab.id)
            if (!timeLimitScreenDataOfCurrTab) {
                localLogMessage("[-] @BlockedSite.jsx, time limit site's tab id is not found in timeLimitScreenData ")
                return
            }

            [hostname, favIconUrl] = timeLimitScreenDataOfCurrTab
            tempCurrTab = {hostname, favIconUrl}
        }

        setCurrTab(tempCurrTab)
        const tempIsBlocked  = await checkLocalBlockedSitesByHostname(hostname)
        setIsBlocked(tempIsBlocked)
    }
    useEffect( ()=>{
        handleComponentMount()
    }, [])

    // *waits for current tab details
    if (!currTab) return <div>Loading...</div>
    const isValidSite = currTab.url ? currTab.url.startsWith('http') : true

    const hostname = currTab.url ? (new URL(currTab.url)).hostname : currTab.hostname // todo: what does it do?
    const handleBlockBtnClick = async ()=>{
        if (isBlocked){
            const isSiteUnblocked = await delLocalBlockedSites(hostname)
            if (isSiteUnblocked) setToastData(['Unblocked the site', 'green'])
            else setToastData(['Error: Site never blocked', 'red'])
        }else{
            const isSiteBlocked = await updateLocalBlockedSites(hostname, currTab.favIconUrl)
            if (isSiteBlocked) setToastData(['Blocked the site', 'green'])
            else setToastData(['Error: Site already blocked', 'green'])
        }

        setIsBlocked(prevIsBlocked=>!prevIsBlocked)
    }
    return (
        <>
            {
                toastMsg ? 
                <PopupToast 
                    key={'popup-toast'}
                    toastMsg={toastMsg}
                    toastColorCode={toasColorCode}
                    setToastData={setToastData}
                /> : null 
            }
            <div className='block-site-cnt'>
                {
                    isValidSite ? 
                    <SiteDetails  // Shows Current site info(like blocked or not and screen time) 
                        isBlocked={isBlocked}
                        currTab={currTab}
                        hostName={hostname}
                        handleBlockBtnClick={handleBlockBtnClick} 
                    /> : 
                    <InvalidSiteDetails 
                        hostName={hostname}
                    />
                }
                {/* Blocked sites list view */}
                <BlockedSitesInfo 
                    setToastData={setToastData}
                /> 
            </div>
        </>
    )
}


function SiteDetails({isBlocked, currTab, hostName, handleBlockBtnClick}){
    const [count , setCount] = useState(30) // wait time to unblock site

    useEffect(()=>{
        if (isBlocked && count > 0){
            setTimeout(()=>{
                setCount((prevCount)=>prevCount-1)
            }, 1000)
        }
    }, [count, isBlocked])

    return (
    <div className="content">
        <div 
            // className="icon-cnt">
            className={"icon-cnt " + (isBlocked ? "block" : " ")}>
            <div className="icon">
                <img 
                    src={currTab.favIconUrl ? currTab.favIconUrl: "../../../png/globe.png" } 
                    alt="icon" 
                    className={isBlocked ? 'block' : null}
                />
            </div>
        </div>
        <div className= { 'host-name ' + (isBlocked ? 'blocked' : '')}>
            {hostName}
        </div>
        <SiteInfoCard 
            hostname={hostName}
        />
        <button 
            className={'btn '}
            onClick={()=>{
                if (!isBlocked || count <= 0){
                    handleBlockBtnClick(isBlocked)
                }
                window.close()
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
function InvalidSiteDetails({hostName}){

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
            <InfoIcon />
            <h3>
                This site cannot be blocked
            </h3>
        </div>
    </div>  
    )
}
export default BlockSites

//! debug purpose
const debugTab = {
    "active": true,
    "audible": false,
    "autoDiscardable": true,
    "discarded": false,
    "favIconUrl": "https://freefrontend.com/favicon.ico",
    "groupId": -1,
    "height": 745,
    "highlighted": true,
    "id": 1458856812,
    "incognito": false,
    "index": 1,
    "mutedInfo": {
        "muted": false
    },
    "pinned": false,
    "selected": true,
    "status": "complete",
    "title": "91 Checkboxes CSS",
    "url": "https://freefrontend.com/css-checkboxes/",
    "width": 1536,
    "windowId": 1458856332
}