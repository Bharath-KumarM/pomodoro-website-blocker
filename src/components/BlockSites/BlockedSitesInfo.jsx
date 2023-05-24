import { AiFillCaretDown as DownIcon} from "react-icons/ai"
import { useEffect, useState } from "react"

import "./BlockedSiteInfo.scss"
import BlockedSitesList from './BlockedSitesList'


const BlockedSitesInfo = ({setToastData})=>{
    const [isDropDownClicked, setIsDropDownClicked] = useState(false)

    return(
        <div 
            id="block-site-list-id"
            className={"block-site-list-cnt " + (isDropDownClicked ? 'clicked' : '')}
            >
            {
                isDropDownClicked ?
                <BlockedSitesList 
                    setToastData={setToastData}
                 /> : 
                <div 
                    className="block-site-show-btn" 
                    onClick={()=>{setIsDropDownClicked(true)}}
                    onWheel={e=>console.log(e)}
                    >
                    <DownIcon />
                </div>
            }
        </div>
    )
}

export default BlockedSitesInfo

