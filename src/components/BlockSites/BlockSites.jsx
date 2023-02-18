import { useEffect, useState } from "react"

import BlockSiteList from "./BlockSiteList"

import "./BlockSites.scss"


const BlockSites = ({setCntHeading})=>{
    const [currTab, setCurrTab] = useState(null)
    const [isBlocked, setIsBlocked] = useState(null)

    useEffect( ()=>{
        // Debug start
        setCurrTab(debugTab)
        setIsBlocked(false)
        return;
        // Debug End

        // Get Current Tab
        getCurrTab().then( tempCurrTab =>{
            setCurrTab(tempCurrTab)
            // Check for current tab domain
            const hostName = (new URL(tempCurrTab.url)).hostname
            getIsBlocked(hostName).then((tempIsBlocked)=>{
                setIsBlocked(tempIsBlocked)
            })
        })

    }, [])

    // wait for current tab details
    if (!currTab) return <div>Loading...</div>
    const hostName = (new URL(currTab.url)).hostname
    const handleBtnClick = async ()=>{

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
            <div className="content">
                <div 
                    // className="icon-cnt">
                    className={"icon-cnt " + (isBlocked ? "block" : " ")}>
                    <div className="icon">
                        <img 
                            src={currTab.favIconUrl ? currTab.favIconUrl: "../../assets/png/globe.png" } 
                            alt="icon" 
                            className={isBlocked ? 'block' : null}
                        />
                    </div>
                </div>
                <div className= { 'host-name ' + (isBlocked ? 'blocked' : '')}>
                    {hostName}
                </div>
                <div className="screen-time-info-cnt">
                    <div className="screen-time-title">
                        Screen Time
                    </div>
                    <hr className="screen-time-line" />
                    <div className="screen-time-data">
                        2hr 5min, Today
                    </div>
                </div>
                <button 
                    className={'btn '}
                    onClick={()=>{
                        handleBtnClick(isBlocked)
                    }}
                >
                    {
                        isBlocked === null ? 'Loading...' :
                        isBlocked === true ? 'Unblock this site' :
                        isBlocked === false ? 'Block this site' : null
                     }
                </button>
            </div>
            <BlockSiteList />
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
// To debug purpose
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

export default BlockSites