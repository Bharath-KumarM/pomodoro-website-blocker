import { useEffect, useRef, useState } from "react"
import styles from "./Pomodoro.module.scss"

import PomodoroSetup from "./PomodoroSetup"
import PomodoroRun from "./PomodoroRun"
import PomodoroDone from "./PomodoroDone"

// Hardcoded data
const defaultPomoData = { 
    mode: 'setup', 
    // focusTime: 25, 
    // sortBreakTime: 5, 
    // longBreakTime: 30, 
    // cycleNumber: 4
    focusTime: 1, 
    sortBreakTime: 1, 
    longBreakTime: 1, 
    cycleNumber: 4
}    

const Pomodoro = ({})=>{

    const [pomoData, setPomoData] = useState({mode: 'getData'})
    
    // Messge from Background Script
    const handleMessage = (data, sender, sendResponse)=>{
        const { pomoData } = data
        // Pomodoro Data
        if (pomoData){
            // Update the UI
            setPomoData({...pomoData})
        }
    }

    // Message Listener
    useEffect(()=>{
        chrome.runtime.onMessage.addListener(handleMessage)
        
        return ()=>{
            chrome.runtime.onMessage.removeListener(handleMessage)
        }
        
    }, [])


    //TODO: Get data from message instead of getting from local stograge
    if (pomoData.mode === 'getData'){
        chrome.storage.local.get('pomoData', ({pomoData: storedPomoData})=>{
            if (storedPomoData) {
                setPomoData(storedPomoData)
            }
            else  {
                chrome.storage.local.set({pomoData: {...defaultPomoData}},()=>{
                    setPomoData(defaultPomoData)
                }) 
            }
        })

        return <div>Loading...</div>
    }
    

    return  pomoData.mode === 'setup' ? 
                <PomodoroSetup  
                    pomoData={pomoData}
                    /> :
            pomoData.mode === 'run' ? 
                <PomodoroRun 
                    pomoData={pomoData}
                    /> : 
            pomoData.mode === 'done' ? 
                <PomodoroDone 
                    pomoData={pomoData}
                    /> :
            <div>Error Message: Unexpected pomoData</div>
}
export default Pomodoro



