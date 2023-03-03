import { getDateString } from "../../utilities/date"

console.log('I am content script!!!')

// window.addEventListener('focus', function() {
//     console.log('focused', new Date())
// });

// window.addEventListener('blur', function() {
//     console.log('not focused', new Date())
// });

setInterval(async ()=>{
    let {screenTimeTracker} = await chrome.storage.local.get('screenTimeTracker')
    if (!screenTimeTracker) screenTimeTracker = {}
    if (document.hasFocus()) {
        const dateString = getDateString(0)
        if (screenTimeTracker[dateString] === undefined){
            screenTimeTracker[dateString] = {}
        }
        if (screenTimeTracker[dateString][window.location.host] === undefined){
            screenTimeTracker[dateString][window.location.host] = 0
        }
        screenTimeTracker[dateString][window.location.host]++
        chrome.storage.local.set({screenTimeTracker})
    }

}, 60*1000)