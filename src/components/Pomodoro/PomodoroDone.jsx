import { useState } from "react"

import './PomodoroDone.scss'

// import '../../utilities/date.js'

const PomodoroDone = ({setCntHeading, pomoData}) =>{
    const [todayTomatoes, setTodayTomatoes] = useState(null)

    setCntHeading('Pomodoro Breaks')

    const { 
            focusTime, sortBreakTime, longBreakTime,
            cycleNumber, cycleName,
            mode, currCycle, 
            startTime, timeSpent,
            isPaused 
            } = pomoData


    // Find next cylce
    let nextCycleName = (cycleName === 'focus') ? 'short' : 'focus';
    if (cycleName === 'focus' && currCycle===cycleNumber) nextCycleName = 'long'

    // Cycle Number
    let nextcurrCycle = currCycle
    if (cycleName !== 'focus')  nextcurrCycle++     

    // Next Mode
    let nextMode = 'run'
    if (nextcurrCycle > cycleNumber) {
        //One session completed
        nextMode = 'setup' //[note] find a way to start from cycle 1
    }

    // Description
    let btnDesc = ''
    let headingDesc = ''
    if (nextCycleName === 'focus') {
        btnDesc = 'Start Focus'
        headingDesc = 'Start To Focus'
    }
    if (nextCycleName === 'short') {
        btnDesc = 'Short Break'
        headingDesc = 'Take a Short Break'
    }
    if (nextCycleName === 'long') {
        btnDesc = 'Long Break'
        headingDesc = 'Take a Long Break'
    }
    if (cycleName === 'long') {
        btnDesc = 'Start New Cycle'
        headingDesc = 'Congratulation! You Completed A Cycle'
    }

    // Tomatoes
    const doneTomatoes = currCycle
    const notDoneTomatoes = cycleNumber - currCycle


    // handle Click
    const handleStartClick = ()=>{
        chrome.runtime.sendMessage({
            pomoData: {
                ...pomoData, 
                mode: nextMode,
                cycleName: nextCycleName,
                currCycle: nextcurrCycle,
                startTime: Date.now() / 1000,
                timeSpent: 0,
            }, msg: 'start'
        })
    }

    // Only when next cycle is not focus
    const handleSkipClick = ()=>{
        chrome.runtime.sendMessage({
            pomoData: {
                ...pomoData, 
                mode: nextMode,
                cycleName: 'focus',
                currCycle: nextcurrCycle+1,
                startTime: Date.now() / 1000,
                timeSpent: 0,
            }, msg: 'start'
        })
    }

    let skipBreakBtn
    if (nextCycleName !== 'focus') {
        skipBreakBtn = (
            <span onClick={()=>handleSkipClick()} 
                className="skip-btn">
                Skip Break
            </span>
        )
    }


    chrome.storage.local.get('pomoHist', ({pomoHist})=>{
        if (!pomoHist) return
        if (!pomoHist[getDateString(0)]) return
        setTodayTomatoes(pomoHist[getDateString(0)].length)
    })
    return (
        <div className="pomodoro-done-cnt">
            <div className="inner-cnt">
                <div className="start-cnt">
                    <div className="heading">
                        <h3>{headingDesc}</h3>
                        <hr />
                    </div>
                    <div className="desc">
                        {doneTomatoes} 🍎 Completed | {notDoneTomatoes} 🍏 more
                    </div>
                    <button className='start-btn' onClick={()=>{
                        console.log('clicked')
                        handleStartClick()
                    }}>
                        {btnDesc}
                    </button>

                    {skipBreakBtn}

                </div>
                <div className="today-cnt">
                    <h4 className="desc">
                        Today - {todayTomatoes} pomodoros 
                    </h4>
                    <hr />
                    <div className="tomatoes">
                        {getTomatoEmojis(todayTomatoes)}
                    </div>
                </div>

            </div>
        </div>

    )
    
}

export default PomodoroDone




function getTomatoEmojis(todayTomatoes) {
    if (todayTomatoes === null) return null
    let tomatoesEmoji = ''
    if (todayTomatoes > 20) tomatoesEmoji = '+'

    for (let i = 0; i < Math.min(todayTomatoes, 20); i++) {
        tomatoesEmoji = '🍎' + tomatoesEmoji
    }
    return tomatoesEmoji
}

function getDateString (n){ 
    if (!n) n=0
    const askedDate = new Date(Date.now() + (n*864e5)); // 864e5 == 86400000 == 24*60*60*1000
    const year = askedDate.toLocaleString("default", { year: "numeric" });
    const month = askedDate.toLocaleString("default", { month: "2-digit" });
    const day = askedDate.toLocaleString("default", { day: "2-digit" });

    return `${day}-${month}-${year}`
}

function getCurrentTime () {
    const currDate = new Date()
    const hour = currDate.toLocaleString("default", { hour: "2-digit" }).split(" ")[0];
    const noon = currDate.toLocaleString("default", { hour: "2-digit" }).split(" ")[1];
    const minute = currDate.toLocaleString("default", { minute: "2-digit" });

    return `${noon}:${hour}:${minute}`
}