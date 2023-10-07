import { useEffect, useState } from 'react';
import { MdOutlineArrowDropDown as DropDownIcon} from 'react-icons/md';
import './BlockedScreen.scss';

import { getLocalBlockedScreenDataByTabId } from '../../localStorage/localBlockedScreenData'

import { 
    checkLocalBlockedSitesByHostname, 
    delLocalBlockedSites
} from '../../localStorage/localBlockedSites'
import { NavBarInScreen } from '../../utilities/NavBarInScreen';
import { EndNoteInScreen } from '../../utilities/EndNoteInScreen';


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
    
    useEffect(()=>{
        handleCompountMounted()
    }, [])

    useEffect(()=>{
        handleCountUpdate()

        return ()=>{
            clearTimeout(countTimierID)
        }
    }, [count])

    let countTimierID
    const isUnblockBtnActive = count <= 0

    if (count < -60){
        chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.remove(tab.id, function() { 
                console.log('close the tab')
            });
        });
    }

    function handleCountUpdate(){
        countTimierID = setTimeout(()=>{
            setCount((prevCount)=>prevCount-1)
        }, 1000)
    }

    async function handleCompountMounted(){
        
        const {tabId} = await chrome.runtime.sendMessage({getTabId: true})
        const blockedScreenDataOfCurrTab = await getLocalBlockedScreenDataByTabId(tabId)

        if (!blockedScreenDataOfCurrTab) {
            console.log('Issue: no blockedScreeendata from BG')
            window.close()
            return null;
        }
        const [tempHostname, tempFavIcon, tempUrl] = blockedScreenDataOfCurrTab

        const isBlockedSite = await checkLocalBlockedSitesByHostname(tempHostname)
        if (!isBlockedSite){
            // *Got unblocked - refresh with a blocked url
            window.location = tempUrl
            // chrome.tabs.update(tabId, {url: tempUrl})
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

    async function handleUnblockBtnClick(){
        const isSiteUnblockSucessFul = await delLocalBlockedSites(hostname)
        if(isSiteUnblockSucessFul){
            chrome.tabs.update(tabId, {url})
        }
    }

    return (
    <div className='blocked-scrn-cnt'>
        <NavBarInScreen />

        {
            !hostname ? 
            <h1>
                Loading...
            </h1> : 
            <>
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
                    <div className='btn-cnt'>
                        <div className='btn-inner-cnt'>
                            <button
                                className='btn close-tab'
                                onClick={()=> window.close()}
                            >
                                Close this tab
                            </button>
                        </div>
                        {
                            <button 
                                className={`btn unblock ${isUnblockBtnActive ? 'active': 'not-active'}`}
                                onClick={()=>{
                                    if (!isUnblockBtnActive) {
                                        return null;
                                    }

                                    handleUnblockBtnClick()
                                }}
                            >
                                {`Unblock this site ${isUnblockBtnActive ? '' : `(${count})`}`}
                            </button> 
                        }
                        {
                            count < -50 ? 
                            <h2>
                                {`No Action taken, closing in ${count+60} seconds...`}
                            </h2> 
                            :
                            null
                        }
                    </div> 
                </div>
            </>
        }
        <EndNoteInScreen />
    </div>
    )
}

export default BlockedScreen
