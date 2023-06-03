import { getLocalScreenTimeTracker, setLocalScreenTimeTracker } from "../../localStorage/localScreenTimeTracker";
import { getDateString } from "../../utilities/date"

console.log('content script running...')

// * Debug Starts - testing new feature
let START_TIME = new Date

const updateSpentTime = async ()=>{
    if (START_TIME === null) return;

    const spentTimeInMinutes = (new Date - START_TIME) ? (new Date - START_TIME)/(1000*60) : 0
    START_TIME = null

    let {screenTimeTracker} = await getLocalScreenTimeTracker()

    const dateString = getDateString(0)
    if (screenTimeTracker[dateString] === undefined){
        screenTimeTracker[dateString] = {}
    }

    if (screenTimeTracker[dateString][window.location.host] === undefined){
        screenTimeTracker[dateString][window.location.host] = 0
    }
    screenTimeTracker[dateString][window.location.host] +=  spentTimeInMinutes
    setLocalScreenTimeTracker(screenTimeTracker)
}

updateSpentTime()

window.addEventListener('focus', ()=>{
    START_TIME = new Date
})
window.addEventListener('blur', ()=>{
    updateSpentTime()
})

window.addEventListener("beforeunload", function(event) {
    updateSpentTime()
//   return ' ';
});
window.addEventListener("onunload", function(event) {
    updateSpentTime()
//   return ' ';
});