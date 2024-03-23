import React, { Children, StrictMode, createElement } from 'react'
import ReactDOM from 'react-dom/client'

import NotificationCard from './NotificationCard'

import { getLocalScreenTimeTracker, setLocalScreenTimeTracker } from "../../localStorage/localScreenTimeTracker";
import { updateLocalTimeLimitScreenDataByTab } from "../../localStorage/localTimeLimitScreenData";
import { checkScreenTimeSurpassedLimit } from "../../utilities/chrome-tools/chromeApiTools";
import { getDateString } from "../../utilities/date"
import { getLocalTakeABreakTrackerforRestrict } from '../../localStorage/localTakeABreakTrackerforRestrict';
import { getLocalSettingsData } from '../../localStorage/localSettingsData';
import { getLocalFavIconUrlData } from '../../localStorage/localFavIconUrlData';



const IS_DEBUG_ACTIVE = true
console.log('content script running')

let START_TIME = null
let IS_FOCUSED = false
let IS_AUDIBLE = false
let INTERVAL_ID

const hostname = window.location.hostname;
const url = window.location.href

// Initial focus
if (document.hasFocus()){
    handleFocus()
}

// Initial audio active check
checkCurrentTabAudibleActive()

// Update extenstion badge
updateBadgeIcon({hostname})

// Focus events
window.addEventListener('focus', ()=>{
    handleFocus()
})
window.addEventListener('blur', ()=>{
    handleUnFocus()
})

window.addEventListener("beforeunload", function(event) {
    handleAudibleNotActive()
    handleUnFocus()
});

window.addEventListener("onunload", function(event) {
    handleAudibleNotActive()
    handleUnFocus()
});

chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
        const {
            audibleInfo,
            takeABreakForRestrictRemainingMinutes
        } = request

        if (audibleInfo){
            const {audible} = audibleInfo
            // Audio events
            if (audible === 'check'){
                checkCurrentTabAudibleActive()
            }
            else if (audible){
                handleAudibleActive()
            }else{
                handleAudibleNotActive()
            }
            sendResponse({isMessageReceived: 'good'})
        }
    }
  );



async function checkCurrentTabAudibleActive(){

    if (IS_DEBUG_ACTIVE){
        console.log('checkCurrentTabAudibleActive')
    }

    const shouldCountScreenTimeBgAudio = await getLocalSettingsData('should-count-screen-time-bg-audio')
    if (shouldCountScreenTimeBgAudio === false){
        return false
    }

    const { audible } = await chrome.runtime.sendMessage({
        checkCurrentTabAudible: true
    })

    console.log({audible})

    if (audible){
        handleAudibleActive()
    }
}
// handler functions
function handleFocus(){
    if (IS_DEBUG_ACTIVE){
        console.log('focus started ✨')
    }

    IS_FOCUSED = true
    startTimeCounting()
}
function handleUnFocus(){

    if (IS_DEBUG_ACTIVE){
        console.log('focus stopped 💤')
    }
    IS_FOCUSED = false
    endTimeCounting()
}

function handleAudibleActive(){
    if (IS_DEBUG_ACTIVE){
        console.log('audio active 🔊')
    }

    IS_AUDIBLE = true;
    startTimeCounting()

}
function handleAudibleNotActive(){
    if (IS_DEBUG_ACTIVE){
        console.log('audio not active 🔇')
    }

    IS_AUDIBLE = false
    endTimeCounting()

}

// time counting functions
async function startTimeCounting(){
    if (IS_DEBUG_ACTIVE){
        console.log('start time counting 🏃🏼‍♂️')
    }

    updateBadgeIcon({hostname})

    if (START_TIME === null){
        START_TIME = new Date
        clearInterval(INTERVAL_ID)
        INTERVAL_ID = setInterval(() => {
                periodicRefresh()
            }, 1000*60);
    }

}
async function endTimeCounting(){

    if (IS_DEBUG_ACTIVE){
        console.log('end time counting 🚫')
    }


    if (START_TIME === null) {
        console.log('!!! Bug !!!! "START_TIME null in endTimeCount"');
        return null;
    }

    if ( IS_AUDIBLE === true || IS_FOCUSED === true ){
        if (IS_DEBUG_ACTIVE){
            console.log((IS_AUDIBLE ? 'Still audio palying🔉' : 'Still focusing🎯'))
        }
        return null;
    }

    clearInterval(INTERVAL_ID)

    const spentTimeInMinutes = (new Date - START_TIME) ? (new Date - START_TIME)/(1000*60) : 0
    if (IS_DEBUG_ACTIVE){
        console.log('Added ' + spentTimeInMinutes + ' minutes screentime')
    }
    START_TIME = null

    const dateString = getDateString(0)
    let screenTimeTracker = await getLocalScreenTimeTracker()

    if (screenTimeTracker[dateString] === undefined){
        screenTimeTracker[dateString] = {}
    }

    if (screenTimeTracker[dateString][hostname] === undefined){
        screenTimeTracker[dateString][hostname] = 0
    }
    screenTimeTracker[dateString][hostname] +=  spentTimeInMinutes
    await setLocalScreenTimeTracker(screenTimeTracker)
    const isBadgeIconUpdated = await updateBadgeIcon({hostname})

    const isTimeLimitScreenForced = await checkAndForceTimeLimitScreen()

    return true;
}

async function periodicRefresh(){
    if (IS_DEBUG_ACTIVE){
        console.log('periodic refresh running!!! at ', new Date())
    }

    if (START_TIME === null) {
        console.log('!!! Bug !!!! "START_TIME null in periodicRefresh"');
        return null;
    }
    let spentTimeInMinutes = (new Date - START_TIME) ? (new Date - START_TIME)/(1000*60) : 0;
    if (spentTimeInMinutes > 1){
        spentTimeInMinutes = 1
    }

    if ( IS_AUDIBLE === true || IS_FOCUSED === true ){
        START_TIME = new Date
    }

    const dateString = getDateString(0)
    let screenTimeTracker = await getLocalScreenTimeTracker()

    if (screenTimeTracker[dateString] === undefined){
        screenTimeTracker[dateString] = {}
    }

    if (screenTimeTracker[dateString][hostname] === undefined){
        screenTimeTracker[dateString][hostname] = 0
    }
    screenTimeTracker[dateString][hostname] +=  spentTimeInMinutes
    
    await setLocalScreenTimeTracker(screenTimeTracker)
    const isBadgeIconUpdated = await updateBadgeIcon({hostname})
    if (isBadgeIconUpdated){
        console.log('Badge updated!!!')
    }

    const isTimeLimitScreenForced = await checkAndForceTimeLimitScreen()

    return true;
}

async function getFavIconUrl(hostname){
    let link = document.querySelector("link[rel~='icon']")

    if (link){
        return link.href
    }

    const localFavIconUrlData = await getLocalFavIconUrlData()
    return localFavIconUrlData[hostname]
}

async function checkAndForceTimeLimitScreen(){
    const isScreenTimeSurpassedLimit = await checkScreenTimeSurpassedLimit(hostname)
    if (!isScreenTimeSurpassedLimit){
        return false;
    }

    const favIconUrl = await getFavIconUrl(hostname)
    const {tabId} = await chrome.runtime.sendMessage({getTabId: true})
    const {isLocalTimeLimitScreenDataByTabUpdated} = await chrome.runtime.sendMessage(
        {updateLocalTimeLimitScreenDataByTabMsg: [tabId, [hostname, favIconUrl, url]]}
    )
    return true;
}

async function updateBadgeIcon({hostname}){
    await chrome.runtime.sendMessage({updateBadgeIcon: {hostname}})
}




// ! Debug starts
// debugAddMinutesToScreenTime(hostname, 5)
async function debugAddMinutesToScreenTime(hostname, timeInMinutes){
    if (hostname !== hostname){
        return null;
    }

    let screenTimeTracker = await getLocalScreenTimeTracker()

    const dateString = getDateString(0)
    if (screenTimeTracker[dateString] === undefined){
        screenTimeTracker[dateString] = {}
    }

    if (screenTimeTracker[dateString][hostname] === undefined){
        screenTimeTracker[dateString][hostname] = 0
    }

    screenTimeTracker[dateString][hostname] =  timeInMinutes
    setLocalScreenTimeTracker(screenTimeTracker)
}

// ! Debug ends

//* Notification card UI
const htmlElement = document.getElementsByTagName('html')[0]
const hostElement = document.createElement('be-focused')
htmlElement.appendChild(hostElement)

const shadowRoot = hostElement.attachShadow({ mode: 'closed' });
const RenderCntElement = document.createElement('div')
shadowRoot.appendChild(RenderCntElement)

RenderCntElement.style.position = 'fixed'
RenderCntElement.style.top = '0'
RenderCntElement.style.right = '0'
RenderCntElement.style.zIndex = '2147483642'


function getNotificationData(takeABreakForRestrictRemainingMinutes){
    return {
        headingMsg: 'Ready to focus',
        paraMsg: `Focus mode resumes in ${takeABreakForRestrictRemainingMinutes} minute`,
        optionArr: [
            {
                name: 'Resume now',
                handleClick: async ()=>{
                    console.log('Resume now clicked!!!')
                    await chrome.runtime.sendMessage(
                        {handleTurnOffLocalTakeABreakTrackerforRestrict: true}
                    )

                    return true;
                }
            },
            {
                name: 'Wait for 5+ more minutes',
                handleClick: async ()=>{
                    await chrome.runtime.sendMessage(
                        {
                            createTakeABreak: {
                                timeInMinutes: 5+takeABreakForRestrictRemainingMinutes
                            }
                        }
                    )
                    return true;

                // remove the card
                }
            }
        ],
        updateBadgeIcon: ()=>{
            updateBadgeIcon({hostname})
        }
    }
}


ReactDOM.createRoot(RenderCntElement).render(
    <StrictMode>
        <NotificationCard 
            getNotificationData={getNotificationData}
        />
    </StrictMode>
)