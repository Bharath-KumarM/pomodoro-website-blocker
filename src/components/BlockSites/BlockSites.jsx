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
    const [toastMsg, setToastMsg] = useState(null) //* Toast Message from bottom

    
    const handleComponentMount = async ()=>{
        // *Get Current tab opened by user
        const tempCurrTab = await getCurrTab()
        const urlPathname = (new URL(tempCurrTab.url)).pathname
        const hostName = (new URL(tempCurrTab.url)).hostname

        // *If the current tab is blocked and blocked screen is loaded, then get the site details from blockedScreenData local storage
        if (urlPathname === '/src/pages/blocked-screen/blocked-screen.html'){
            const {blockedScreenData} = await chrome.storage.local.get('blockedScreenData')
            if (!blockedScreenData[tempCurrTab.id]) {
                localLogMessage("[-] @BlockedSite.jsx, blocked site's remove tab id is not found in blockedScreenData ")
                return
            }
            const [hostname, favIconUrl] = blockedScreenData[tempCurrTab.id]

            const {blockedSites} = await chrome.storage.local.get('blockedSites')

            setCurrTab({hostname, favIconUrl})
            setIsBlocked(blockedSites[hostname] ? true : false)
            return null;
        }

        // *Check whether it is blocked
        const tempIsBlocked = await getIsBlocked(hostName)
        if (tempIsBlocked){
            localLogMessage("[-] @BlockedSite.jsx, blocked site but not blocked screen loaded. BG script is not forcing blocked screen html")
        }
        setCurrTab(tempCurrTab)
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
        const res = await blockOrUnblockSite(!isBlocked, hostname, currTab.favIconUrl)
        if (res){
            setIsBlocked(prevIsBlocked=>!prevIsBlocked)
            if (isBlocked) setToastMsg('Unblocked Successfully!')
            else setToastMsg('Blocked Successfully!')
        }
        else{
            if (isBlocked) setToastMsg('Error on unblocking the site')
            else setToastMsg('Error on blocking the site')
        }
    }
    return (
        <>
            {
                toastMsg ? 
                <PopupToast 
                    key={'popup-toast'}
                    toastMsg={toastMsg}
                    setToastMsg={setToastMsg}
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
                    setToastMsg={setToastMsg}
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