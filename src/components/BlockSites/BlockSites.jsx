import { useEffect, useState } from "react"

import {ImCheckboxUnchecked as BlockIcon} from "react-icons/im"
import {SlFire as FireIcon} from "react-icons/sl"
import {BiInfoCircle as InfoIcon} from "react-icons/bi"

import BlockedSitesInfo from "./BlockedSiteInfo"
import SiteInfoCard from "./SiteInfoCard"

import "./BlockSites.scss"


const BlockSites = ({setCntHeading})=>{
    const [currTab, setCurrTab] = useState(null)
    const [isBlocked, setIsBlocked] = useState(null)
    
    useEffect( ()=>{
        //! Debug start
        // setCurrTab(debugTab)
        // setIsBlocked(false)
        // return;
        //! Debug End

        // Get Current Tab
        getCurrTab().then( tempCurrTab =>{
            // Check for current tab domain
            const hostName = (new URL(tempCurrTab.url)).hostname
            // Check whether it is blocked
            getIsBlocked(hostName).then((tempIsBlocked)=>{
                setCurrTab(tempCurrTab)
                setIsBlocked(tempIsBlocked)
            })
        })

    }, [])

    // wait for current tab details
    if (!currTab) return <div>Loading...</div>
    const isValidSite = currTab.url.startsWith('http')

    const hostName = (new URL(currTab.url)).hostname
    const handleBlockBtnClick = async ()=>{

        let message
        if (isBlocked === null ) message = ''
        else if (isBlocked === false) message = 'newBlockSite'
        else message = 'unBlockSite'
        const {responseIsBlocked} = await chrome.runtime.
                sendMessage({
                    blockSitesData: {
                        hostName: hostName,
                        favIconUrl: currTab.favIconUrl
                    }, 
                    msg: message,
                })
        setIsBlocked(responseIsBlocked)
    }
    return (
        <div className='block-site-cnt'>
            {
                isValidSite ? 
                <SiteDetails 
                    isBlocked={isBlocked}
                    currTab={currTab}
                    hostName={hostName}
                    handleBlockBtnClick={handleBlockBtnClick} 
                /> : 
                <InvalidSiteDetails 
                    hostName={hostName}
                />
            }
            <BlockedSitesInfo />
        </div>
    )
}

async function getIsBlocked(hostName){
    let {blockedSites} = await chrome.storage.local.get('blockedSites')
    let isHostFound = false
    for (const [blockedHostname, blockedFavIconUrl] of blockedSites){
        if (blockedHostname === hostName) {
        isHostFound = true
        break
        }
    }
    return isHostFound
}
async function getCurrTab(){
    let queryOptions = { active: true, lastFocusedWindow: true }
    
    let [currTab] = await chrome.tabs.query(queryOptions)
    return currTab
}



function SiteDetails({isBlocked, currTab, hostName, handleBlockBtnClick}){

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
                handleBlockBtnClick(isBlocked)
            }}
        >
            {
                isBlocked === null ? 'Loading...' :
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

//! To debug purpose
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