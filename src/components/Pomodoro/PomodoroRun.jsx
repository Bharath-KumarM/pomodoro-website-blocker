import { useMemo } from 'react'
import { useRef } from 'react'
import { useState, useEffect } from 'react'
import Btn2Cnt from '../../utilities/Btn2Cnt'
import './PomodoroRun.scss'

import ProgressBar from './ProgressBar'

const PomodoroRun = ({setCntHeading, pomoData})=>{
    // State Hooks
    const [currTime, setCurrTime] = useState(Date.now() / 1000)

    // Destructure PomodoroData
    const { 
        focusTime, sortBreakTime, longBreakTime,
        cycleNumber, cycleName,
        mode, currCycle, 
        startTime, timeSpent,
        isPaused 
        } = pomoData
    
    // Refresh UI every second
    let intervalId
    useEffect(()=>{
        // Set Heading
        setCntHeading(getHeadingDesc(cycleName))

        if (!isPaused){
            intervalId = setInterval(()=>{
                setCurrTime(Date.now() / 1000)
            }, 1000) 
        }
        
        return ()=>{
            clearTimeout(intervalId)
        }
    }, [pomoData.isPaused])

    

    // Calculate Reminding Time for the cycle
    const [focusTimeInSec, sortBreakTimeInSec, longBreakTimeInsec] = [focusTime*60, sortBreakTime*60, longBreakTime*60]
    let totalTime
    if (cycleName === 'focus') totalTime = focusTimeInSec
    if (cycleName === 'short') totalTime = sortBreakTimeInSec
    if (cycleName === 'long') totalTime = longBreakTimeInsec
    let actualTimePassed = isPaused ? timeSpent : currTime - startTime + timeSpent
    const remainingTime = totalTime - actualTimePassed
    
    const handlePauseClick = ()=>{
        const clickTime = Date.now() / 1000
        chrome.runtime.sendMessage({
            pomoData: {
                ...pomoData,
                startTime: 0,
                timeSpent: timeSpent+(clickTime-startTime),
                isPaused: true
            }, msg: 'pause'
        })
    }

    const handelResumeClick = ()=>{
        const clickTime = Date.now() / 1000
        chrome.runtime.sendMessage({
            pomoData:{
                ...pomoData,
                startTime: clickTime,
                isPaused: false
            }, msg: 'start'
        })
    }
    
    let cycleDesc
    if (cycleName === 'focus') cycleDesc = 'Focusing'
    if (cycleName === 'short') cycleDesc = 'Short Break'
    if (cycleName === 'long') cycleDesc = 'Long Break'
    //Button
    let btn1Details = null
    if (cycleName === 'focus'){
        btn1Details = {
            // desc: isPaused ? `Resume ${cycleDesc}` : `Pause ${cycleDesc}`,
            desc: isPaused ? `Resume` : `Pause`,
            onClick: ()=>{
                if (!isPaused) handlePauseClick()
                else handelResumeClick()
            },
            style: 'btn-resume'
        }
    }
    const btn2Details = {
        desc: 'Stop Pomodoro',
        onClick: ()=>{
            // Send message to background script
            chrome.runtime.
                sendMessage({pomoData: {...pomoData, mode: 'setup'}, 
                    msg: 'stop'})
        },
        style: 'btn-stop'
    }
                
    return (
        <div className='pomodoro-run-cnt'>
            <div className="inner-cnt">
                <ProgressBar 
                    remainingTime={remainingTime}
                    cycleNumber={cycleNumber} 
                    focusTimeInSec={focusTimeInSec}
                    sortBreakTimeInSec={sortBreakTimeInSec}
                    longBreakTimeInsec={longBreakTimeInsec}
                    currCycle={currCycle}
                    cycleName={cycleName}
                    />
                <div className="time-outter-cnt">
                    <div className='time-cnt'>
                        <div className="time">
                            {getTimeFormat(remainingTime)}
                        </div>
                        <div className="unit">
                            hr min sec
                        </div>
                    </div>
                    
                    {
                        cycleName !== 'focus' ? 
                            <div className="skip-break-btn">
                                Skip break
                            </div> : 
                            <div className="note">
                                {getNote(cycleName)}
                            </div>
                    }
                </div>

                <Btn2Cnt btn1Details={btn1Details} btn2Details={btn2Details} />
            </div>
        </div>
    )
}

export default PomodoroRun

// Helper Funcitons
const getTimeFormat = (timeInSec)=>{
    const time = timeInSec

    const [hr, min, sec] = [
        ("0"+parseInt(time/3600)).slice(-2), 
        ("0"+parseInt(time/(60))).slice(-2), 
        ("0"+parseInt(time%60)).slice(-2)
    ]

    return `${hr}:${min}:${sec}`
}



function getHeadingDesc (cycleName){
    if (cycleName === 'focus') return 'Focus'
    if (cycleName === 'short') return 'Short Break'
    if (cycleName === 'long') return 'Long Break'
    console.log('[-] Problem, cycle name not found: ' + cycleName )
}
function getNote(cycleName){
    if (cycleName === 'focus') return 'Stay focused🔥'
    if (cycleName === 'short') return 'Relax, break time❄️'
    if (cycleName === 'long') return 'Relax, break time❄️'
    console.log('[-] Problem, cycle name not found: ' + cycleName )
}
