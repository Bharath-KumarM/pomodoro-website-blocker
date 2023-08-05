import { getLocalScreenTimeTracker, setLocalScreenTimeTracker } from "../../localStorage/localScreenTimeTracker";
import { updateLocalTimeLimitScreenDataByTab } from "../../localStorage/localTimeLimitScreenData";
import { checkScreenTimeSurpassedLimit } from "../../utilities/chrome-tools/chromeApiTools";
import { getDateString } from "../../utilities/date"



const DEBUG = false

let START_TIME = null
let IS_FOCUSED = false
let IS_AUDIBLE = false
let INTERVAL_ID

const hostname = window.location.hostname;
const favIconUrl = getFavIconUrl(hostname)
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
        const {audibleInfo} = request

        if (audibleInfo){
            const {audible} = audibleInfo
            // Audio events
            if (audible){
                handleAudibleActive()
            }else{
                handleAudibleNotActive()
            }
            sendResponse({isMessageReceived: 'good'})
            return true;
        }
    }
  );



async function checkCurrentTabAudibleActive(){

    if (DEBUG){
        console.log('checkCurrentTabAudibleActive')
    }

    const { audible } = await chrome.runtime.sendMessage({
        checkCurrentTabAudible: true
    })

    if (audible){
        handleAudibleActive()
    }
}
// handler functions
function handleFocus(){
    if (DEBUG){
        console.log('handleFocus')
    }

    IS_FOCUSED = true
    startTimeCounting()
}
function handleUnFocus(){

    if (DEBUG){
        console.log('handleUnFocus')
    }
    IS_FOCUSED = false
    endTimeCounting()
}

function handleAudibleActive(){
    if (DEBUG){
        console.log('handleAudibleActive')
    }

    IS_AUDIBLE = true;
    startTimeCounting()

}
function handleAudibleNotActive(){
    if (DEBUG){
        console.log('handleAudibleNotActive')
    }

    IS_AUDIBLE = false
    endTimeCounting()

}

// time counting functions
async function startTimeCounting(){
    if (DEBUG){
        console.log('startTimeCounting')
    }

    if (START_TIME === null){
        START_TIME = new Date
        clearInterval(INTERVAL_ID)
        INTERVAL_ID = setInterval(() => {
                periodicRefresh()
            }, 1000*60);
    }

}
async function endTimeCounting(){

    if (DEBUG){
        console.log('endTimeCounting')
    }


    if (START_TIME === null) {
        console.log('!!! Bug !!!! "START_TIME null in endTimeCount"');
        return null;
    }

    if ( IS_AUDIBLE === true || IS_FOCUSED === true ){
        if (DEBUG){
            console.log('Either IS_AUDIBLE or IS_FOCUSED is true')
        }
        return null;
    }

    clearInterval(INTERVAL_ID)

    const spentTimeInMinutes = (new Date - START_TIME) ? (new Date - START_TIME)/(1000*60) : 0
    START_TIME = null

    const dateString = getDateString(0)
    let {screenTimeTracker} = await getLocalScreenTimeTracker()

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
    if (START_TIME === null) {
        console.log('!!! Bug !!!! "START_TIME null in periodicRefresh"');
        return null;
    }
    const spentTimeInMinutes = (new Date - START_TIME) ? (new Date - START_TIME)/(1000*60) : 0;

    if ( IS_AUDIBLE === true || IS_FOCUSED === true ){
        START_TIME = new Date
    }

    const dateString = getDateString(0)
    let {screenTimeTracker} = await getLocalScreenTimeTracker()

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

async function checkAndForceTimeLimitScreen(){
    const isScreenTimeSurpassedLimit = await checkScreenTimeSurpassedLimit(hostname)
    if (!isScreenTimeSurpassedLimit){
        return false;
    }

    const {tabId} = await chrome.runtime.sendMessage({getTabId: true})
    await updateLocalTimeLimitScreenDataByTab(tabId, [hostname, favIconUrl, url])
    return true;
}

async function updateBadgeIcon({hostname}){
    const {isBadgeIconUpdated} = await chrome.runtime.sendMessage(
        {updateBadgeIcon: {hostname}}
    )
}

function getFavIconUrl(hostname){
    let link = document.querySelector("link[rel~='icon']")

    if (!link){
        return `http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`
    }

    return link.href
}

// ! Debug starts
// debugAdd5MinutesScreenTime('fireship.io', 10)
async function debugAdd5MinutesScreenTime(hostname, timeInMinutes){
    if (hostname !== hostname){
        return null;
    }

    let {screenTimeTracker} = await getLocalScreenTimeTracker()

    const dateString = getDateString(0)
    if (screenTimeTracker[dateString] === undefined){
        screenTimeTracker[dateString] = {}
    }

    if (screenTimeTracker[dateString][hostname] === undefined){
        screenTimeTracker[dateString][hostname] = 0
    }

    if (screenTimeTracker[dateString][hostname] < timeInMinutes){
        screenTimeTracker[dateString][hostname] =  timeInMinutes
        setLocalScreenTimeTracker(screenTimeTracker)
    }
}
// ! Debug ends