import { AiFillCaretDown as DownIcon} from "react-icons/ai"
import { useEffect, useState } from "react"

import "./BlockedSiteInfo.scss"
import BlockedSitesList from './BlockedSitesList'


const BlockedSitesInfo = ()=>{
    //! Debug Starts
    const [showBlockedSite, setShowBlockedSite] = useState(false)
    const [blockedSites, setBlockedSites] = useState(null)
    //! Debug Ends

    useEffect(()=>{
        if (!showBlockedSite) return
        const element = document.getElementById('block-site-list-id');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    })

    const handleShowBtnClick = () =>{
        if (showBlockedSite){
            setShowBlockedSite(prevClicked => !prevClicked)
            setBlockedSites(null)
        }
        else {
            
            chrome.storage.local.get('blockedSites').then(({blockedSites})=>{
                if(!blockedSites) return 
                setBlockedSites(blockedSites)
                setShowBlockedSite(prevClicked => !prevClicked)
            })
            //! Debug Starts
            // setBlockedSites(blockedSitesArrDebug)
            // setShowBlockedSite(prevClicked => !prevClicked)
            //! Debug Ends
        }
    }

    return(
        <div 
            id="block-site-list-id"
            className={"block-site-list-cnt " + (showBlockedSite ? 'clicked' : '')}
            >
            {
                !blockedSites ?
                <div 
                    className="block-site-show-btn" 
                    onClick={()=>{handleShowBtnClick()}}
                    >
                    <DownIcon />
                </div>
                : 
                <BlockedSitesList 
                    blockedSites={blockedSites}
                />
            }
        </div>
    )
}

export default BlockedSitesInfo


const blockedSitesArrDebug = [
    [
        "replit.com",
        "https://replit.com/public/icons/favicon-prompt-192.png"
    ],
    [
        "fireship.io",
        "https://fireship.io/img/favicon.png"
    ],
    [
        "moderncss.dev",
        "https://moderncss.dev/favicon.png"
    ],
    [
        "www.scaler.com",
        "https://www.scaler.com/topics/favicon.ico"
    ]
]