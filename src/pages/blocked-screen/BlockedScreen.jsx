import { useEffect, useState } from 'react';
import { MdOutlineArrowDropDown as DropDownIcon} from 'react-icons/md';
import './BlockedScreen.scss';
import { blockOrUnblockSite } from '../../utilities/chromeApiTools';


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

    const [hostname, favIcon] = blockedSiteData ? blockedSiteData : [null, null]
    
    const handleCompountMounted = async () =>{

        const {blockedScreenData} = await chrome.storage.local.get('blockedScreenData')
        
        const {tabId} = await chrome.runtime.sendMessage({getTabId: true})


        if (!blockedScreenData[tabId]) {
            console.log('Issue: no blockedScreeendata from BG')
            return null;
        }
        const [tempHostname, tempFavIcon, tempUrl] = blockedScreenData[tabId]

        const {blockedSites} = await chrome.storage.local.get('blockedSites')
        if (!blockedSites[tempHostname]){
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

        setBlockedSiteData([tempHostname, tempFavIcon])
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
        const res = await blockOrUnblockSite(false, hostname, favIcon)
        if (res){
            location.reload()
        }else{

            return res
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

const BlockBtn = ()=>{
    const [leftTime, setLeftTime] = useState(60)
    const [isBtnActive, setIsBtnAtive] = useState(false)
    useEffect(()=>{
        if (leftTime > 1){
            setTimeout(()=>{
                setLeftTime(prevLeftTime => prevLeftTime-1)
            }, 1000)
        }
        else {
            setIsBtnAtive(true)
        }
    }, [leftTime, isBtnActive])
    return (
        <button 
            className="btn"
            onClick={async ()=>{
                if (isBtnActive){
                    const {blockedSites} = await chrome.storage.local.get('blockedSites')

                }
            }}
        >
            {isBtnActive ? `Cooling Time (${leftTime}sec)` : 'Unblock Site'} 
        </button>
    )
}

