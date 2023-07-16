import { useEffect, useState } from 'react';
import { MdOutlineArrowDropDown as DropDownIcon} from 'react-icons/md';
import './BlockedScreen.scss';

import { getLocalBlockedScreenDataByTabId } from '../../localStorage/localBlockedScreenData'

import { 
    checkLocalBlockedSitesByHostname, 
    delLocalBlockedSites
} from '../../localStorage/localBlockedSites'


const countDownMsg = [
    'Take a deep breath❄️',
    'Take a deep breath❄️',
    'Relax...🧊',
    'Relax...🧊',
    'Think why you blocked this site now!🤔',
    'Think why you blocked this site now!🤔',
    'Think why you blocked this site now!🤔',
    'Still you want to unblock this site',
    'Still you want to unblock this site',
    'Still you want to unblock this site',
    'Okay...',
    'Okay...',
    'Go Head...',
    'Go Head...'
]
const BlockedScreen = ()=>{
    const [blockedSiteData, setBlockedSiteData] = useState(null)
    const [count, setCount] = useState(30)

    const [hostname, favIcon, url] = blockedSiteData ? blockedSiteData : [null, null]
    
    const handleCompountMounted = async () =>{
        
        const {tabId} = await chrome.runtime.sendMessage({getTabId: true})
        const blockedScreenDataOfCurrTab = await getLocalBlockedScreenDataByTabId(tabId)

        if (!blockedScreenDataOfCurrTab) {
            console.log('Issue: no blockedScreeendata from BG')
            return null;
        }
        const [tempHostname, tempFavIcon, tempUrl] = blockedScreenDataOfCurrTab

        const isBlockedSite = await checkLocalBlockedSitesByHostname(tempHostname)
        if (!isBlockedSite){
            // *Got unblocked - refresh with a blocked url
            chrome.tabs.update(tabId, {url: tempUrl})
            return null;
        }

        // Load FavIcon and title
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = tempFavIcon;
        document.title = `${tempHostname} - 🚫Blocked`

        setBlockedSiteData([tempHostname, tempFavIcon, tempUrl])
    }
    
    useEffect(()=>{
        handleCompountMounted()
    }, [])

    useEffect(()=>{
        setTimeout(()=>{
            setCount((prevCount)=>prevCount-1)
        }, 1000)
    }, [count])

    const handleUnblockBtnClick = async ()=>{
        const isSiteUnblocked = await delLocalBlockedSites(hostname)
        if(isSiteUnblocked){
            chrome.tabs.update(tabId, {url})
        }
    }
    if (count < -60){
        chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.remove(tab.id, function() { 
                console.log('close the tab')
            });
        });
    }

    const handleCloseTabBtnClick = ()=>{
        chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.remove(tab.id, function() { 
                console.log('close the tab')
            });
        });
    }
    return (
    <div className='blocked-scrn-cnt'>
        <div className="heading">
            <h2>
                This site has been blocked by you
            </h2>
        </div>
        <div className="block-site-card">
            <div className='icon-cnt'>
                {favIcon ? <img src={favIcon} alt="icon" /> : null}
            </div>
            <div className='desc-cnt'>
                <h3>
                    {hostname ? hostname : null}
                </h3>
            </div>
            {
                !hostname ? 
                <h1>
                    Loading...
                </h1>
                :
                <div className='btn-cnt'>
                    <div className='btn-inner-cnt'>
                        <button
                            className='btn close-tab'
                            onClick={()=> handleCloseTabBtnClick()}
                        >
                            Close this tab
                        </button>
                    </div>
                    {
                        count <= 0 ? 
                        <button 
                            className='btn unblock'
                            onClick={()=>handleUnblockBtnClick()}
                        >
                            Unblock this site
                        </button> :
                        <>
                                                    {
                            count < 25 ?
                            <h2>
                                {`Wait for ${count} sec to unblock...`}
                            </h2> : null
                        }
                        </>
                        // !motivation message
                        // countDownMsg[30-count] ? 
                        // <h2>
                        //     {countDownMsg[30-count]}
                        // </h2> : 
                    }
                    {
                        count < -50 ? 
                        <h2>
                            No Action taken, closing in few seconds...
                        </h2> 
                        :
                        null
                    }
                </div> 

            }
        </div>
    </div>
    )
}

export default BlockedScreen
