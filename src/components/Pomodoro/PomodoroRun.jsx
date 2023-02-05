import { useMemo } from 'react'
import { useRef } from 'react'
import { useState, useEffect } from 'react'
import Btn2Cnt from '../../utilities/Btn2Cnt'
import './PomodoroRun.scss'

import ProgressBar from './ProgressBar'

const PomodoroRun = ({setCntHeading, pomoData})=>{
    
    // State Hooks
    const [runPomoData, setRunPomoData] = useState(pomoData)
    // Destructure PomodoroData
    const { 
        focusTime, sortBreakTime, longBreakTime,
        cycleNumber, cycleName,
        mode, currCycle, 
        startTime, timeSpent,
        isPaused 
        } = runPomoData

    // Refresh UI every second
    let localTimeout
    useEffect(()=>{
        localTimeout = setTimeout(()=>{
            setRunPomoData({...pomoData})
        }, 1000) 

        return ()=>{
            clearTimeout(localTimeout)
        }
    }, )

    // Set Heading
    setCntHeading(getHeadingDesc(pomoData.cycleName))

    // Calculate Reminding Time for the cycle
    const [focusTimeInSec, sortBreakTimeInSec, longBreakTimeInsec] = [focusTime*60, sortBreakTime*60, longBreakTime*60]
    const currTime = Date.now() / 1000
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
    const btn1Details = {
        desc: isPaused ? `Resume ${cycleDesc}` : `Pause ${cycleDesc}`,
        onClick: ()=>{
            clearTimeout(localTimeout)
            if (!isPaused) handlePauseClick()
            else handelResumeClick()
        },
        style: 'btn-resume'
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
    const btn2 =  useMemo(()=>{
        return <Btn2Cnt btn1Details={btn1Details} btn2Details={btn2Details} />
    }, [isPaused])
                

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
                <div className='time-cnt'>
                    <div className="time">
                        {getTimeFormat(remainingTime)}
                    </div>
                    <div className="unit">
                        hr min sec
                    </div>
                </div>
                {btn2}
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
    if (cycleName === 'focus') return 'Pomodoro Focus'
    if (cycleName === 'short') return 'Pomodoro Short Break'
    if (cycleName === 'long') return 'Pomodoro Long Break'
    console.log('Problem, cycle name not found: ' + cycleName )
}
