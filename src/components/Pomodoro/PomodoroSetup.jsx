import styles from "./PomodoroSetup.module.scss"
import Btn2Cnt from "../../utilities/Btn2Cnt"
import { useEffect, useRef, useState } from "react"


const PomodoroSetup = ({setCntHeading, pomoData})=>{
    useEffect(()=>setCntHeading('Pomodoro Setup'))

    // Default time 
    const {
        focusTime :defFocusTime, 
        sortBreakTime: defSortBreakTime, 
        longBreakTime: defLongBreakTime, 
        cycleNumber: defCycleNumber
    } = pomoData

    // ref input HTML elements
    const [
        refFocusTime, 
        refSortBreakTime, 
        refLongBreakTime, 
        refCycleNumber
    ] = [useRef(null), useRef(null), useRef(null), useRef(null)]

    //Button Details
    const btn1Details = {
        desc: 'Start Session',
        onClick: ()=>{
            const newPomoData = {
                focusTime: parseInt(refFocusTime.current.value),
                sortBreakTime: parseInt(refSortBreakTime.current.value),
                longBreakTime: parseInt(refLongBreakTime.current.value),
                cycleNumber: parseInt(refCycleNumber.current.value)
            }
            const updatedPomoData = {
                ...newPomoData, 
                cycleName: 'focus',
                mode: 'run',
                currCycle: 1, 
                startTime: Date.now()/1000, 
                timeSpent: 0,
                isPaused: false, 
            }
            
            // Send message to background script
            chrome.runtime.
                sendMessage({pomoData: {...updatedPomoData}, msg: 'start'})
        },
        style: styles.btnStart
    }
    const btn2Details = {
        desc: 'Reset Setup',
        onClick: ()=>{
            // Send message to background script
            chrome.runtime.
                sendMessage({pomoData: {}, msg: 'reset'})
        }
    }

    //Render
    return (
        <div className={styles.SetupCnt}>
            <Desc />
            <div className={styles.setup}> 
                <div className={styles.entry}>
                    <div className={styles.inputTitle}>
                        Focus Time
                    </div>
                    <div className={styles.inputEnterCnt}>
                        <input min={1} max={999} step={5} type="number" 
                            ref={refFocusTime}
                            defaultValue={defFocusTime}
                            className={styles.inputField} 
                        />
                        <span className={styles.inputUnit} >Minutes</span>
                    </div> 
                </div>
                <div className={styles.entry}>
                    <div className={styles.inputTitle}>
                        Short Break Time
                    </div>
                    <div className={styles.inputEnterCnt}>
                        <input min={1} max={999} step={5} type="number" 
                            ref={refSortBreakTime}
                            defaultValue={defSortBreakTime}
                            className={styles.inputField} 
                        />
                        <span className={styles.inputUnit} >Minutes</span>
                    </div> 
                </div>
                <div className={styles.entry}>
                    <div className={styles.inputTitle}>
                        Long Break Time
                    </div>
                    <div className={styles.inputEnterCnt}>
                        <input min={1} max={999} step={5} type="number" 
                            ref={refLongBreakTime}
                            defaultValue={defLongBreakTime}
                            className={styles.inputField} 
                        />
                        <span className={styles.inputUnit} >Minutes</span>
                    </div> 
                </div>
                <div className={[styles.entry, styles.lastEntry].join(' ')}>
                    <div className={styles.inputTitle}>
                        # of Cycles
                    </div>
                    <div className={styles.inputEnterCnt}>
                        <input type="number" min={1}  max={10} step={5} 
                            ref={refCycleNumber}
                            defaultValue={defCycleNumber} 
                            className={styles.inputField}
                            />
                        <span className={styles.inputUnit} >Cycles</span>
                    </div> 
                </div>
            </div>
            <Btn2Cnt btn1Details={btn1Details} btn2Details={btn2Details}/>
        </div>
    )
}

export default PomodoroSetup

// Static Component
const Desc = ()=>{
    return (
        <div className={styles.desc}>
            <span className={styles.descText}>Focus</span>
            <span className={styles.descText}>•</span>
            <span className={styles.descText}>Relax</span>
            <span className={styles.descText}>•</span>
            <span className={styles.descText}>Repeat</span>
        </div>
    )
}

