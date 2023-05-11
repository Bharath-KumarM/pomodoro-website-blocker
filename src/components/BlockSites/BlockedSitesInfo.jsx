import { AiFillCaretDown as DownIcon} from "react-icons/ai"
import { useEffect, useState } from "react"

import "./BlockedSiteInfo.scss"
import BlockedSitesList from './BlockedSitesList'


const BlockedSitesInfo = ({setToastData})=>{
    const [blockedSites, setBlockedSites] = useState(null)

    useEffect(()=>{
        if (!blockedSites) return
        const element = document.getElementById('block-site-list-id');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    })

    const handleShowBtnClick = async () =>{ 
        return chrome.storage.local.get('blockedSites').then(({blockedSites})=>{
            if(!blockedSites) return 
            setBlockedSites(blockedSites)
        })
    }
    return(
        <div 
            id="block-site-list-id"
            className={"block-site-list-cnt " + (blockedSites ? 'clicked' : '')}
            >
            {
                !blockedSites ?
                <div 
                    className="block-site-show-btn" 
                    onClick={()=>{handleShowBtnClick()}}
                    onWheel={e=>console.log(e)}
                    >
                    <DownIcon />
                </div>
                : 
                <BlockedSitesList 
                    setToastMsg={setToastData}
                    blockedSites={blockedSites}
                    handleShowBtnClick={handleShowBtnClick}
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