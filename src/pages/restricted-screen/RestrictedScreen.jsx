import { useEffect, useState } from 'react';
import { MdOutlineArrowDropDown as DropDownIcon} from 'react-icons/md';
import './RestrictedScreen.scss';
import { turnOffFocusMode } from '../background/restrictSiteBG';
import { deleteTimeBtwFocusScheduleArr } from '../../utilities/chromeApiTools';
import { getCurrScheduleDesc, getIsTimeBtwFocusSchedule } from '../../utilities/focusModeHelper';


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
    const [scheduleTimeBtwNos, setScheduleTimeBtwNos] = useState(false)
    const [currScheduleDesc, setCurrScheduleDesc] = useState(null)

    const [hostname, favIcon] = restrictedSiteData ? restrictedSiteData : [null, null]
    
    const handleCompountMounted = async () =>{


        const {restrictedScreenData} = await chrome.storage.local.get('restrictedScreenData')

        const {tabId} = await chrome.runtime.sendMessage({getTabId: true})

        if (!restrictedScreenData[tabId]) {
            console.log('Issue: no restrictedScreenData from BG\n', 'tabId:', tabId)
            return null;
        }else{
            console.log('restrictedScreenData from BG\n', 'tabId:', tabId)
        }
        const [tempHostname, tempFavIcon, tempUrl] = restrictedScreenData[tabId]

        // *the site removed from restriction, so reload and force the actual site
        const {restrictedSites} = await chrome.storage.local.get('restrictedSites')
        if (!restrictedSites[tempHostname]){
            chrome.tabs.update(tabId, {url: tempUrl}); 
            return
        }

        // *focus mode break
        const {focusModeTakeABreakTracker} = await chrome.storage.local.get('focusModeTakeABreakTracker')
        if (focusModeTakeABreakTracker){
            chrome.tabs.update(tabId, {url: tempUrl}); 
            return null;
        }

        // *Check schedule Active
        const tempScheduleTimeBtwNos = await getIsTimeBtwFocusSchedule()

        // *Check Focus Mode status
        const {focusModeTracker} = await chrome.storage.local.get('focusModeTracker')
        if (!focusModeTracker && !tempScheduleTimeBtwNos){
            // *Focus Mode turned off, so force the actual site
            chrome.tabs.update(tabId, {url: tempUrl}); 
            return null;
        }

        if (tempScheduleTimeBtwNos) {
            setScheduleTimeBtwNos(tempScheduleTimeBtwNos)
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
        turnOffFocusMode()
    }
    const handleScheduleDelete = async ()=>{
        await deleteTimeBtwFocusScheduleArr(scheduleTimeBtwNos)
        location.reload()
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
        turnOffFocusMode()
        chrome.storage.local.set({focusModeTakeABreakTracker: Date.now() + (timeInMinutes*60*1000)})
        if (scheduleTimeBtwNos){
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
                    scheduleTimeBtwNos ? 
                    `This site scheduled to restrict` : 
                    `Focus Mode is ON, this site has been restricted ` 
                }
            </h2>
            <div className='desc'>
                {
                    scheduleTimeBtwNos ?
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
                            className={`btn ${scheduleTimeBtwNos? 'schedule': ''}`}
                            onClick={()=>{
                                if (scheduleTimeBtwNos){
                                    handleScheduleDelete()
                                }else{
                                    handleFocusModeOff()
                                }
                            }}
                        >
                            {
                                scheduleTimeBtwNos? 
                                `Remove the schedule` :
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
                                count < 25 ? 
                                <h2>
                                    {
                                        scheduleTimeBtwNos ? 
                                        `Wait for ${count} sec to remove the schedule...`:
                                        `Wait for ${count} sec to turn off focus mode...`
                                    }
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

export default RestrictedScreen

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

