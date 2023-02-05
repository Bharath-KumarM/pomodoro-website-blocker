// CSS details are in PromodorRun
import { useEffect, useRef } from 'react'
import './PomodoroProgressBar.scss'

const ProgressBar = ({focusTimeInSec, sortBreakTimeInSec, longBreakTimeInsec,
                    remainingTime, cycleNumber, currCycle, cycleName})=>{
    
    const totalTime = (cycleName==='long') ? focusTimeInSec + longBreakTimeInsec :  focusTimeInSec + sortBreakTimeInSec
    let percentage = (cycleName==='focus') ? 
                        ((focusTimeInSec - remainingTime) / totalTime)*100 : 
                        ((totalTime - remainingTime) / totalTime) * 100
    
    

    // Create Bar
    const ProgressBarRefs = []
    const arr = Array(cycleNumber).fill(0)
    const bars = arr.map((val, index)=>{

        const barRef = useRef(null)
        ProgressBarRefs.push(barRef)

        let currPercentage = 0
        if (index === currCycle-1) currPercentage = percentage
        else if (index < currCycle-1) currPercentage = 100
        currPercentage += '%'

        return (
            <span key={index} className="bar">
                <div  
                    ref={barRef}
                    // className='progress' 
                    style={{width: currPercentage}}
                >
                    
                </div>
            </span>
        )
    })
    

    useEffect(()=>{
        // Bar sliding animation in sequence
        ProgressBarRefs.map((barRef, barIndex)=>{
            if (barIndex > currCycle-1) return
            setTimeout(()=>{
                barRef.current.classList.add('progress')
                if (barIndex === currCycle-1) {
                    setTimeout(()=>barRef.current.classList.add('active'), 600)
                }
            }, barIndex*500)
        })
    }, [])
    // Count Tomatoes
    const tomatoesCount = (cycleName==='focus') ? currCycle-1 : currCycle

    // Description
    let desc2 = `Focus for ${focusTimeInSec/60} minutes`
    if (cycleName==='short') desc2 = `Short Break for ${sortBreakTimeInSec/60} minutes`
    if (cycleName==='long') desc2 = `Long Break for ${longBreakTimeInsec/60} minutes`

    return (
        <div className="progress-cnt">
            <div className="desc">
                {tomatoesCount} 🍎 Completed | {desc2}
            </div>
            <div className="bar-cnt">
                {bars}
            </div>
        </div>
    )
}

export default ProgressBar