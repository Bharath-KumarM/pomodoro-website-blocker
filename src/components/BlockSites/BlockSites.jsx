import { useEffect, useState } from "react"

import {ImCheckboxUnchecked as BlockIcon} from "react-icons/im"
import {SlFire as FireIcon} from "react-icons/sl"
import {BiInfoCircle as InfoIcon} from "react-icons/bi"

import BlockedSitesInfo from "./BlockedSitesInfo"
import SiteInfoCard from "./SiteInfoCard"

import "./BlockSites.scss"


const BlockSites = ({setCntHeading})=>{
    const [currTab, setCurrTab] = useState(null)
    const [isBlocked, setIsBlocked] = useState(null)
    const [updateBlockSiteDetails, setUpdateBlockSiteDetails] = useState(0)
    
    useEffect( ()=>{
        //! Debug start
        // setCurrTab(debugTab)
        // setIsBlocked(false)
        // return;
        //! Debug End

        // Get Current Tab
        getCurrTab().then( async (tempCurrTab) =>{
            if ((new URL(tempCurrTab.url)).pathname === '/src/pages/blocked-screen/blocked-screen.html'){
                const {blockedScreenData} = await chrome.storage.local.get('blockedScreenData')
                if (!blockedScreenData[tempCurrTab.id]) {
                    //todo: Reload the page
                    return
                }
                const [hostname, favIconUrl] = blockedScreenData[tempCurrTab.id]

                const {blockedSites} = await chrome.storage.local.get('blockedSites')

                setCurrTab({hostname, favIconUrl})
                if (blockedSites[hostname]) setIsBlocked(true)
                else setIsBlocked(false)

                return

            }
            // Check for current tab domain
            const hostName = (new URL(tempCurrTab.url)).hostname
            // Check whether it is blocked
            getIsBlocked(hostName).then((tempIsBlocked)=>{
                setCurrTab(tempCurrTab)
                setIsBlocked(tempIsBlocked)
            })
        })

    }, [updateBlockSiteDetails])

    // wait for current tab details
    if (!currTab) return null
    const isValidSite = currTab.url ? currTab.url.startsWith('http') : true

    const hostname = currTab.url ? (new URL(currTab.url)).hostname : currTab.hostname
    const handleBlockBtnClick = async ()=>{

        let message
        if (isBlocked === null ) message = ''
        else if (isBlocked === false) message = 'newBlockSite'
        else message = 'unBlockSite'
        const response = await chrome.runtime.
                sendMessage({
                    blockSitesData: {
                        hostName: hostname,
                        favIconUrl: currTab.favIconUrl
                    }, 
                    msg: message,
                })
        const responseIsBlocked = await response
        setUpdateBlockSiteDetails(prevState => prevState+1)
    }
    return (
        <div className='block-site-cnt'>
            {
                isValidSite ? 
                <SiteDetails 
                    isBlocked={isBlocked}
                    currTab={currTab}
                    hostName={hostname}
                    handleBlockBtnClick={handleBlockBtnClick} 
                /> : 
                <InvalidSiteDetails 
                    hostName={hostname}
                />
            }
            {/* Blocked sites in List View  */}
            <BlockedSitesInfo 
                setUpdateBlockSiteDetails={setUpdateBlockSiteDetails}
            />
        </div>
    )
}

async function getIsBlocked(hostName){
    let {blockedSites} = await chrome.storage.local.get('blockedSites')

    if (!blockedSites){
        chrome.storage.local.set({'blockedSites': {}})
    }
    return blockedSites && blockedSites[hostName] ? true : false
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