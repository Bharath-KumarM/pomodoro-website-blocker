import { useEffect, useState } from 'react';
import { MdOutlineArrowDropDown as DropDownIcon} from 'react-icons/md';
import { AiOutlineInfoCircle as InfoIcon} from 'react-icons/ai';
import { HiPuzzle as PuzzleIcon} from 'react-icons/hi';
import './RestrictedScreen.scss';
import { getCurrScheduleDesc, getActiveFocusScheduledIndexes } from '../../utilities/focusModeHelper';

import { getLocalRestrictedScreenDataByTabId } from '../../localStorage/localRestrictedScreenData'
import { checkLocalRestrictedSitesByHostname, delLocalRestrictedSites } from '../../localStorage/localRestrictedSites';
import { getLocalFocusModeTracker, turnOffLocalFocusModeTracker } from '../../localStorage/localFocusModeTracker';
import { getLocalTakeABreakTrackerforRestrict, turnOnLocalTakeABreakTrackerforRestrict } from '../../localStorage/localTakeABreakTrackerforRestrict';
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
const RestrictedScreen = ()=>{
    const [restrictedSiteData, setRestrictedSiteData] = useState(null)
    const [count, setCount] = useState(30)
    const [activeFocusScheduledIndexes, setActiveFocusScheduledIndexes] = useState([])
    const [currScheduleDesc, setCurrScheduleDesc] = useState(null)

    const [hostname, favIcon] = restrictedSiteData ? restrictedSiteData : [null, null]
    

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

    if (count < -60){
        chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.remove(tab.id, function() { 
                console.log('close the tab')
            });
        });
    }

    const isUnrestrictBtnActive = count <= 0;

    function handleCountUpdate(){
        countTimierID = setTimeout(()=>{
            setCount((prevCount)=>prevCount-1)
        }, 1000)
    }
    async function handleCompountMounted(){
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
        const {takeABreakTrackerforRestrict} = await getLocalTakeABreakTrackerforRestrict()
        if (takeABreakTrackerforRestrict){
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

    const handleFocusModeOff = ()=>{
        turnOffLocalFocusModeTracker()
    }
    const handleUnrestrictSite = async ()=>{
        await delLocalRestrictedSites(hostname)
    }

    const handleCloseTabBtnClick = ()=>{
        chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.remove(tab.id, function() { 
                console.log('close the tab')
            });
        });
    }

    const handleTakeABreakClick = (timeInMinutes)=>{
        const currTimeObj = Date.now()
        turnOnLocalTakeABreakTrackerforRestrict(currTimeObj + (timeInMinutes*60*1000))

        chrome.alarms.create(
            `takeABreakForRestrict`,
            {
                when: currTimeObj + (timeInMinutes*60*1000),
            }
        )
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
                    {
                        activeFocusScheduledIndexes.length ? 
                        `This site is scheduled to restrict` : 
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
                        <button 
                            className={`btn ${ isUnrestrictBtnActive ? 'active': 'not-active'}`}
                            onClick={()=>{
                                if (!isUnrestrictBtnActive) {
                                    return null;
                                }

                                if (activeFocusScheduledIndexes.length){
                                    handleUnrestrictSite()
                                }else{
                                    handleFocusModeOff()
                                }
                            }}
                        >
                            {
                                activeFocusScheduledIndexes.length ? 
                                `Unrestrict the site ${isUnrestrictBtnActive ? '' : `(${count})`}` :
                                `Turn off focus mode ${isUnrestrictBtnActive ? '' : `(${count})`}`
                            }
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
            </div>
            </>
        }
        <EndNoteInScreen />
    </div>
    )
}

export default RestrictedScreen
