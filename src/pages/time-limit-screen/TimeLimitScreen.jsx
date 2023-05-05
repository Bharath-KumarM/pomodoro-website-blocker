import { useEffect, useState } from 'react';
import { MdOutlineArrowDropDown as DropDownIcon} from 'react-icons/md';
import './TimeLimitScreen.scss';
import { turnOffFocusMode } from '../background/restrictSiteBG';
import { getIsScreenTimeSurpassedLimit, refreshAllTimeLimitTabs } from '../../utilities/chromeApiTools';


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
const TimeLimitScreen = ()=>{
    const [currSiteData, setCurrSiteData] = useState(null)
    const [count, setCount] = useState(30)

    const [hostname, favIcon] = currSiteData ? currSiteData : [null, null]
    
    const handleCompountMounted = async () =>{

        const {timeLimitScreenData} = await chrome.storage.local.get('timeLimitScreenData')
        
        const {tabId} = await chrome.runtime.sendMessage({getTabId: true})

        if (!timeLimitScreenData[tabId]) {
            console.log('Issue: no timeLimitScreenData from BG')
            return null;
        }
        const [tempHostname, tempFavIcon, tempUrl] = timeLimitScreenData[tabId]

        
        // * checks whether timi limit increased or removed
        const isScreenTimeSurpassedLimit = await getIsScreenTimeSurpassedLimit(tempHostname)
        console.log({tempHostname, isScreenTimeSurpassedLimit})
        if (!isScreenTimeSurpassedLimit){
            chrome.tabs.update(tabId, {url: tempUrl}); 
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
        document.title = `${tempHostname} - Time Limit`

        setCurrSiteData([tempHostname, tempFavIcon])
    }
    
    useEffect(()=>{
        handleCompountMounted()
    }, [])

    useEffect(()=>{
        setTimeout(()=>{
            setCount((prevCount)=>prevCount-1)
        }, 1000)
    }, [count])

    // *To automatically close tab
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

    const handleUnpauseSite = async ()=>{
        let {screenTimeLimit} = await chrome.storage.local.get('screenTimeLimit')
        if (!screenTimeLimit) screenTimeLimit = {}

        delete screenTimeLimit[hostname]
        await chrome.storage.local.set({screenTimeLimit})
        refreshAllTimeLimitTabs()
    }
    return (
    <div className='blocked-scrn-cnt'>
        <div className="heading">
            <h2>
                You have exceeded the daily time limit
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
                            className='btn remove-time-limit'
                            onClick={()=>handleUnpauseSite()}
                        >
                            Remove Time Limit
                        </button> :
                        // !motivation message, maybe added later
                        // countDownMsg[30-count] ? 
                        // <h2>
                        //     {countDownMsg[30-count]}
                        // </h2> : 
                        <>
                            {
                                count < 25 ?
                                <h2>
                                    {`Wait for ${count} sec to remove time limit...`}
                                </h2> : null
                            }
                        </>
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

export default TimeLimitScreen



