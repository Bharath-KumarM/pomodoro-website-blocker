import { getLocalScreenTimeTracker, setLocalScreenTimeTracker } from "../../localStorage/localScreenTimeTracker";
import { getDateString } from "../../utilities/date"

const dateString = getDateString(0)

const DEBUG = false

let START_TIME = null
let IS_FOCUSED = false
let IS_AUDIBLE = false

// Initial focus
if (document.hasFocus()){
    handleFocus()
}
// Initial audio active check
checkCurrentTabAudibleActive()


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

// Audio events
chrome.runtime.onMessage.addListener( ({audible}, sender, sendResponse) => {
        if (audible){
            handleAudibleActive()
        }else{
            handleAudibleNotActive()
        }
        sendResponse({isMessageReceived: 'good'})
        return true
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

    const spentTimeInMinutes = (new Date - START_TIME) ? (new Date - START_TIME)/(1000*60) : 0
    START_TIME = null

    let {screenTimeTracker} = await getLocalScreenTimeTracker()

    if (screenTimeTracker[dateString] === undefined){
        screenTimeTracker[dateString] = {}
    }

    if (screenTimeTracker[dateString][window.location.host] === undefined){
        screenTimeTracker[dateString][window.location.host] = 0
    }
    screenTimeTracker[dateString][window.location.host] +=  spentTimeInMinutes
    setLocalScreenTimeTracker(screenTimeTracker)


}
// ! Debug starts
// debugAdd5MinutesScreenTime('fireship.io', 10)
async function debugAdd5MinutesScreenTime(hostname, timeInMinutes){
    if (window.location.host !== hostname){
        return null;
    }

    let {screenTimeTracker} = await getLocalScreenTimeTracker()

    const dateString = getDateString(0)
    if (screenTimeTracker[dateString] === undefined){
        screenTimeTracker[dateString] = {}
    }

    if (screenTimeTracker[dateString][window.location.host] === undefined){
        screenTimeTracker[dateString][window.location.host] = 0
    }

    if (screenTimeTracker[dateString][window.location.host] < timeInMinutes){
        screenTimeTracker[dateString][window.location.host] =  timeInMinutes
        setLocalScreenTimeTracker(screenTimeTracker)
    }
}
// ! Debug ends