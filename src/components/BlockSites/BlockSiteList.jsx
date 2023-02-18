import "./BlockSitesList.scss"
import { AiFillCaretDown } from "react-icons/ai"
import { createRef, useEffect, useState } from "react"

const BlockSiteList = ()=>{
    const [showBlockedSite, setShowBlockedSite] = useState(false)
    const [blockedSites, setBlockedSites] = useState(null)

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
            //
            // chrome.storage.local.get('blockedSites').then(({blockedSites})=>{
            //     if(!blockedSites) return 
            //     setBlockedSites(blockedSites)
            //     setShowBlockedSite(prevClicked => !prevClicked)
            // })
            setBlockedSites(blockedSitesArrDebug)
            setShowBlockedSite(prevClicked => !prevClicked)
        }
    }

    let content = blockedSites ?  
                    createBlockedSiteList(blockedSites) : 
                    <div 
                        className="block-site-show-btn" 
                        onClick={()=>{handleShowBtnClick()}}
                        >
                        <AiFillCaretDown />
                    </div>

    return(
        <div 
            id="block-site-list-id"
            className={"block-site-list-cnt " + (showBlockedSite ? 'clicked' : '')}
            >
            {content}
        </div>
    )
}

export default BlockSiteList

function createBlockedSiteList(blockedSites){
    const siteElements = []
    for (const [host, favIconUrl] of blockedSites){
        const entry = (

        <tr>
            <td>
                <input type="checkbox" checked/>
            </td>
            <td>
                <img src={favIconUrl} alt="icon" />
            </td>
            <td>{host}</td>
        </tr>
        )
        siteElements.push(entry)

    }
    return (
        <>
            <h3> Blocked Sites </h3>
            <table class="block-site-list-table">
                {siteElements}
            </table>
        </>
    )

}
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