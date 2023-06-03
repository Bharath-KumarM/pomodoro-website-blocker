import { useEffect, useState } from 'react';
import { MdOutlineArrowDropDown as DropDownIcon} from 'react-icons/md';
import './RestrictedScreen.scss';
import { getCurrScheduleDesc, getActiveFocusScheduledIndexes } from '../../utilities/focusModeHelper';

import { getLocalRestrictedScreenDataByTabId } from '../../localStorage/localRestrictedScreenData'
import { checkLocalRestrictedSitesByHostname, delLocalRestrictedSites, getLocalRestrictedSites } from '../../localStorage/localRestrictedSites';
import { getLocalFocusModeTracker, turnOffLocalFocusModeTracker } from '../../localStorage/localFocusModeTracker';
import { getLocalFocusModeTakeABreakTracker, setLocalFocusModeTakeABreakTracker } from '../../localStorage/localFocusModeTakeABreakTracker';



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
const RestrictedScreen = ()=>{
    const [restrictedSiteData, setRestrictedSiteData] = useState(null)
    const [count, setCount] = useState(30)
    const [activeFocusScheduledIndexes, setActiveFocusScheduledIndexes] = useState([])
    const [currScheduleDesc, setCurrScheduleDesc] = useState(null)

    const [hostname, favIcon] = restrictedSiteData ? restrictedSiteData : [null, null]
    
    const handleCompountMounted = async () =>{


        // Gets from service worker
        const {tabId} = await chrome.runtime.sendMessage({getTabId: true})

        const currTabRestrictedScreenData = await getLocalRestrictedScreenDataByTabId(tabId)
        
        if (!currTabRestrictedScreenData) {
            console.log('Issue: no restrictedScreenData from BG\n', 'tabId:', tabId)
            return null;
        }
        const [tempHostname, tempFavIcon, tempUrl] = currTabRestrictedScreenData

        // the site removed from restriction, so reload and force the actual site
        const isRestrictedSite = await checkLocalRestrictedSitesByHostname(tempHostname)
        if (!isRestrictedSite){
            chrome.tabs.update(tabId, {url: tempUrl}); 
            return
        }

        // focus mode break
        const {focusModeTakeABreakTracker} = await getLocalFocusModeTakeABreakTracker()
        if (focusModeTakeABreakTracker){
            chrome.tabs.update(tabId, {url: tempUrl}); 
            return null;
        }

        // *Get schedule Active
        const tempActiveFocusScheduledIndexes = await getActiveFocusScheduledIndexes()

        // *Check Focus Mode status
        const {focusModeTracker} = await getLocalFocusModeTracker()
        if (!focusModeTracker && !tempActiveFocusScheduledIndexes.length){
            // *Focus Mode turned off, so force the actual site
            chrome.tabs.update(tabId, {url: tempUrl}); 
            return null;
        }

        if (tempActiveFocusScheduledIndexes.length) {
            setActiveFocusScheduledIndexes(tempActiveFocusScheduledIndexes)
            const tempCurrScheduleDesc = await getCurrScheduleDesc()
            setCurrScheduleDesc(tempCurrScheduleDesc)
        }

        // Load FavIcon and title
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = tempFavIcon;
        document.title = `${tempHostname} - 🚫Restricted`

        setRestrictedSiteData([tempHostname, tempFavIcon])
    }

    
    useEffect(()=>{
        handleCompountMounted()
    }, [])

    useEffect(()=>{
        setTimeout(()=>{
            setCount((prevCount)=>prevCount-1)
        }, 1000)
    }, [count])

    const handleFocusModeOff = ()=>{
        turnOffLocalFocusModeTracker()
    }
    const handleUnrestrictSite = async ()=>{
        await delLocalRestrictedSites(hostname)
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

    const handleTakeABreakClick = (timeInMinutes)=>{
        turnOffLocalFocusModeTracker()

        setLocalFocusModeTakeABreakTracker(Date.now() + (timeInMinutes*60*1000))
        
        if (activeFocusScheduledIndexes.length){
            chrome.alarms.create(
                `scheduleTakeABreak`,
                {
                    when: Date.now() + (timeInMinutes*60*1000),
                }
            ) 

        }else{
            chrome.alarms.create(
                `focusModeTakeABreak`,
                {
                    when: Date.now() + (timeInMinutes*60*1000),
                }
            ) 
        }
    }
    return (
    <div className='blocked-scrn-cnt'>
        <div className="heading">
            <h2>    
                {
                    activeFocusScheduledIndexes.length ? 
                    `This site scheduled to restrict` : 
                    `Focus Mode is ON, this site has been restricted ` 
                }
            </h2>
            <div className='desc'>
                {
                    activeFocusScheduledIndexes.length ?
                    currScheduleDesc : 
                    null
                }
            </div>
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
                            className='btn drop-down take-a-break'
                        >
                            <ul>
                                <li>
                                    <div className='heading-desc'>
                                        <p>Take a break</p>
                                        <DropDownIcon />
                                    </div>
                                    <ul>
                                        <li onClick={()=>handleTakeABreakClick(5)}>
                                            For 5 minutes
                                        </li>
                                        <li onClick={()=>handleTakeABreakClick(15)}>
                                            For 15 minutes
                                        </li>
                                        <li onClick={()=>handleTakeABreakClick(30)}>
                                            For 30 minutes
                                        </li>
                                    </ul> 
                                </li>
                            </ul>
                            
                        </button>
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
                            className={`btn ${activeFocusScheduledIndexes.length ? 'schedule': ''}`}
                            onClick={()=>{
                                if (activeFocusScheduledIndexes.length){
                                    handleUnrestrictSite()
                                }else{
                                    handleFocusModeOff()
                                }
                            }}
                        >
                            {
                                activeFocusScheduledIndexes.length ? 
                                `Unrestrict the site` :
                                `Turn off focus mode`
                            }
                        </button> :
                        // todo: Add motivation message later if needed
                        // countDownMsg[30-count] ? 
                        // <h2>
                        //     {countDownMsg[30-count]}
                        // </h2> : 
                        <>
                            {
                                
                                // count < 25 ? // No need to hide message 
                                <h2>
                                    {
                                        activeFocusScheduledIndexes.length ? 
                                        `Wait for ${count} sec to remove the schedule...`:
                                        `Wait for ${count} sec to turn off focus mode...`
                                    }
                                </h2>

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

export default RestrictedScreen
