import { useEffect, useState } from 'react';
import { MdOutlineArrowDropDown as DropDownIcon} from 'react-icons/md';
import './TimeLimitScreen.scss';
import { checkScreenTimeSurpassedLimit } from '../../utilities/chrome-tools/chromeApiTools';

import { getLocalTimeLimitScreenDataByTabId } from '../../localStorage/localTimeLimitScreenData'
import { delLocalScreenTimeLimit } from '../../localStorage/localScreenTimeLimit';
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
const TimeLimitScreen = ()=>{
    const [currSiteData, setCurrSiteData] = useState(null)
    const [count, setCount] = useState(30)
    const [hostname, favIcon] = currSiteData ? currSiteData : [null, null]
    
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
    const isRemoveTimeLimitBtnActive = count <= 0

    // *To automatically close tab
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

        const currTabTimeLimitScreenData = await getLocalTimeLimitScreenDataByTabId(tabId)

        if (!currTabTimeLimitScreenData) {
            console.log('Issue: no timeLimitScreenData from BG')
            return null;
        }
        const [tempHostname, tempFavIcon, tempUrl] = currTabTimeLimitScreenData

        
        // * checks whether timi limit increased or removed
        const isScreenTimeSurpassedLimit = await checkScreenTimeSurpassedLimit(tempHostname)

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

    function handleCloseTabBtnClick(){
        chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.remove(tab.id, function() { 
                console.log('close the tab')
            });
        });
    }

    async function handleUnpauseSite() {
        const isTimeLimitDeleted = await delLocalScreenTimeLimit(hostname)
    }

    return (
    <div className='blocked-scrn-cnt'>
        <NavBarInScreen />
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
                        <button 
                            className={`btn remove-time-limit ${isRemoveTimeLimitBtnActive ? 'active': 'not-active'}`}
                            onClick={()=>{
                                if (!isRemoveTimeLimitBtnActive) {
                                    return null;
                                }
                                handleUnpauseSite()
                            }}
                        >
                            {`Remove Time Limit ${isRemoveTimeLimitBtnActive ? '' : `(${count})`}`}
                        </button>
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
        <EndNoteInScreen />
    </div>
    )
}

export default TimeLimitScreen



