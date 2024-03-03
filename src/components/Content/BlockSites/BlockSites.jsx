import { useState } from "react"

import "./BlockSites.scss"
import { PopupToast } from "../../../utilities/PopupScreens"

import BlockedSitesList from "./BlockedSitesList"
import NavBar from "../NavBar/NavBar"

export const BlockSites = ({setNavSelect})=>{
    const [toastData, setToastData] = useState([]) //* Toast Message from bottom

    const [toastMsg, toasColorCode] = toastData

    return  <>
            {
                toastMsg ? 
                <PopupToast 
                    key={'popup-toast'}
                    toastData={toastData}
                    setToastData={setToastData}
                /> : null 
            }
            <NavBar 
                setNavSelect={setNavSelect}
                navDetailsArr={[['Block site', 'block-site']]}
            />
            <div className="block-site-cnt">
                <div className="block-site-list-cnt">
                    <BlockedSitesList 
                        setToastData={setToastData}
                    />
                </div>
            </div>
        </>
    
    
}

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