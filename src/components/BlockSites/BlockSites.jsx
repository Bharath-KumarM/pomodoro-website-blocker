import { useEffect, useState } from "react"

import {ImCheckboxUnchecked as BlockIcon} from "react-icons/im"
import {SlFire as FireIcon} from "react-icons/sl"
import {BiInfoCircle as InfoIcon} from "react-icons/bi"

import BlockedSitesInfo from "./BlockedSitesInfo"
import SiteInfoCard from "./SiteInfoCard"
import { localLogMessage } from "../../utilities/localStorage"
import { blockOrUnblockSite, getCurrTab } from "../../utilities/chromeApiTools"

import "./BlockSites.scss"
import { PopupToast } from "../../utilities/PopupScreens"


// In popup screen, it creates the UI to block current website.
const BlockSites = ({setCntHeading})=>{
    const [currTab, setCurrTab] = useState(null)
    const [isBlocked, setIsBlocked] = useState(null)
    const [toastData, setToastData] = useState(null) //* Toast Message from bottom

    const [toastMsg, toasColorCode] = toastData

    const handleComponentMount = async ()=>{
        // *Get Current tab opened by user
        let tempCurrTab = await getCurrTab()
        let urlPathname = (new URL(tempCurrTab.url)).pathname
        let hostname = (new URL(tempCurrTab.url)).hostname
        let favIconUrl = tempCurrTab.favIconUrl

        // *If the current tab is blocked and blocked screen is loaded, then get the site details from blockedScreenData local storage
        if (urlPathname === '/src/pages/blocked-screen/blocked-screen.html'){
            const {blockedScreenData} = await chrome.storage.local.get('blockedScreenData')
            if (!blockedScreenData[tempCurrTab.id]) {
                localLogMessage("[-] @BlockedSite.jsx, blocked site's tab id is not found in blockedScreenData ")
                return
            }

            [hostname, favIconUrl] = blockedScreenData[tempCurrTab.id]
            tempCurrTab = {hostname, favIconUrl}
        }
        if (urlPathname === '/src/pages/restricted-screen/restricted-screen.html'){
            const {restrictedScreenData} = await chrome.storage.local.get('restrictedScreenData')
            if (!restrictedScreenData[tempCurrTab.id]) {
                localLogMessage("[-] @BlockedSite.jsx, restricted site's tab id is not found in restrictedScreenData ")
                return
            }

            [hostname, favIconUrl] = restrictedScreenData[tempCurrTab.id]
            tempCurrTab = {hostname, favIconUrl}
        }
        if (urlPathname === '/src/pages/time-limit-screen/time-limit-screen.html'){
            const {timeLimitScreenData} = await chrome.storage.local.get('timeLimitScreenData')
            if (!timeLimitScreenData[tempCurrTab.id]) {
                localLogMessage("[-] @BlockedSite.jsx, time limit site's tab id is not found in timeLimitScreenData ")
                return
            }

            [hostname, favIconUrl] = timeLimitScreenData[tempCurrTab.id]
            tempCurrTab = {hostname, favIconUrl}
        }

        setCurrTab(tempCurrTab)
        setIsBlocked(await getIsBlocked(hostname))
    }
    useEffect( ()=>{
        handleComponentMount()
    }, [])

    // *waits for current tab details
    if (!currTab) return <div>Loading...</div>
    const isValidSite = currTab.url ? currTab.url.startsWith('http') : true

    const hostname = currTab.url ? (new URL(currTab.url)).hostname : currTab.hostname // todo: what does it do?
    const handleBlockBtnClick = async ()=>{
        const res = await blockOrUnblockSite(!isBlocked, hostname, currTab.favIconUrl)
        if (res){
            setIsBlocked(prevIsBlocked=>!prevIsBlocked)
            if (isBlocked) setToastData(['Unblocked Successfully!', 'red'])
            else setToastData(['Blocked Successfully!', 'green'])
        }
        else{
            if (isBlocked) setToastData(['Error on unblocking the site', 'red'])
            else setToastData(['Error on blocking the site', 'red'])
        }
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

async function getIsBlocked(hostName){
    let {blockedSites} = await chrome.storage.local.get('blockedSites')
    return blockedSites && blockedSites[hostName] ? true : false
}




function SiteDetails({isBlocked, currTab, hostName, handleBlockBtnClick}){
    const [count , setCount] = useState(30) // wait time to unblock site

    useEffect(()=>{
        if (isBlocked && count > 0){
            setTimeout(()=>{
                setCount((prevCount)=>prevCount-1)
            }, 1000)
        }
    }, [count])

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