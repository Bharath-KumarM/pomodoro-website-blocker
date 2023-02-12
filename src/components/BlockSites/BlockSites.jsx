import { useEffect, useState } from "react"
import { AiFillCaretDown as DownIcon } from "react-icons/ai"

import "./BlockSites.scss"


const BlockSites = ({setCntHeading})=>{
    const [currTab, setCurrTab] = useState(null)
    // const currTab = testTab
    // console.log(currTab)
    useEffect(()=>{
        setCntHeading('Block Sites')
        getCurrTab(setCurrTab)
    }, [])

    // wait for current tab details
    if (!currTab) return <div>Loading...</div>

    const hostName = (new URL(currTab.url)).hostname
    const handleBtnClick = ()=>{
        chrome.runtime.
                sendMessage({
                    blockSitesData: {
                        hostName: hostName,
                        favIconUrl: currTab.favIconUrl
                    }, 
                    msg: 'newBlockSite'
                })
    }
    return (
        <div className='block-site-cnt'>
            <div className="content">
                <div className="icon-cnt">
                    <div className="icon">
                        <img src={currTab.favIconUrl} alt="icon" />
                    </div>
                </div>
                <div className="host-name">
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
                    className="btn"
                    onClick={()=>{
                        handleBtnClick()
                    }}
                >
                    Block this Site
                </button>
            </div>
            <div className="footer">
                <div className="btn-cnt">
                    <DownIcon />
                </div>
            </div>
        </div>
    )
}

function getSiteDomain(url){

}
async function getCurrTab(setCurrTab){
    let queryOptions = { active: true, lastFocusedWindow: true }
    
    let [tab] = await chrome.tabs.query(queryOptions)
    // console.log(tab)
    setCurrTab(tab)
}
const testTab = {
    "active": true,
    "audible": false,
    "autoDiscardable": true,
    "discarded": false,
    "favIconUrl": "https://fireship.io/img/favicon.png",
    "groupId": -1,
    "height": 745,
    "highlighted": true,
    "id": 1458854904,
    "incognito": false,
    "index": 1,
    "mutedInfo": {
        "muted": false
    },
    "pinned": false,
    "selected": true,
    "status": "complete",
    "title": "Fireship - Learn to Code Faster",
    "url": "https://fireship.io/",
    "width": 1536,
    "windowId": 1458854722
}

export default BlockSites