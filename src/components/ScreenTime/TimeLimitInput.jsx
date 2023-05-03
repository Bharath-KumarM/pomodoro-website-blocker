import './TimeLimitInput.scss'

import { BiInfoCircle, BiTime } from "react-icons/bi"
import { RiCloseLine } from 'react-icons/ri'

import { pad2 } from '../../utilities/simpleTools'
import { useEffect, useState } from 'react'
import {  refreshAllTabsByHostname } from '../../utilities/chromeApiTools'


const hrValues = Array.from({length: 24}, (_ ,index)=>pad2(index))
const minValues = Array.from({length: 12}, (_ ,index)=>pad2(index*5))

const TimeLimitInput = ({showTimeLimitInput: hostname, setShowTimeLimitInput, setScreenTimeLimit})=>{
    const [hours, setHours] = useState(0)
    const [minutes, setMinutes] = useState(30)
    const [isLimited, setIsLimited] = useState(false)

    useEffect(()=>{
        const getData = async ()=>{

            let {screenTimeLimit} = await chrome.storage.local.get('screenTimeLimit')
            if (!screenTimeLimit[hostname]) return;
            
            const [tempHour, tempMinute] = screenTimeLimit[hostname]
            setIsLimited(true)
            setHours(pad2(tempHour))
            setMinutes(pad2(tempMinute))
        }

        getData()
    }, [])

    return (
    <div className='time-limit-input-popup-cnt'
        onClick={e=>e.stopPropagation()}
    >
        <button 
            className='close btn'
            onClick={()=>{
                setShowTimeLimitInput(false)
            }}
        >
            <RiCloseLine />
        </button>
        <h2 className="heading">
            Set Time Limit 
        </h2>
        <div className="time-input-cnt">
                <select 
                    id="time-hr" 
                    className='time-input hr'
                    defaultValue={'00'}
                    value={hours}
                    onChange={(e)=> {
                        setHours(e.target.value)
                    }}
                >
                    {
                        hrValues.map((val, index)=>{
                            return <option key={index}>{val}</option>
                        })
                    }
                </select>
                <div className="colon">
                    Hours
                </div>
                <select 
                    id="time-min" 
                    className='time-input min'
                    defaultValue={'30'}
                    value={minutes}
                    onChange={(e)=> {
                        setMinutes(e.target.value)
                    }}
                >
                    {
                        minValues.map((val, index)=>{
                            return <option key={index}>{val}</option>
                        })
                    }
                </select>
                <div className="colon">
                    Minutes
                </div>
                <BiTime />
        </div>
        <input 
            value='Set'
            // className={isUserInputValid ? 'set-input active' : 'set-input'}
            className={'set-input active'}
            type="submit" 
            onClick={(e)=>{
                const storeData = async ()=>{
                    let {screenTimeLimit} = await chrome.storage.local.get('screenTimeLimit')
                    if (!screenTimeLimit) screenTimeLimit = {}

                    screenTimeLimit[hostname] = [parseInt(hours), parseInt(minutes)]

                    chrome.storage.local.set({screenTimeLimit}, async ()=>{
                        setShowTimeLimitInput(false)
                        setScreenTimeLimit(null)
                        refreshAllTabsByHostname(hostname)
                    })

                }

                storeData()
            }}

        />
        {
            isLimited ?
            <div className="remove-cnt"
                onClick={()=>{
                    const deleteSiteData = async ()=>{
                        let {screenTimeLimit} = await chrome.storage.local.get('screenTimeLimit')
                        if (!screenTimeLimit) screenTimeLimit = {}
    
                        delete screenTimeLimit[hostname]
    
                        chrome.storage.local.set({screenTimeLimit}, ()=>{
                            console.log('screenTimeLimit: ', screenTimeLimit)
                            setShowTimeLimitInput(false)
                            setScreenTimeLimit(null)
                        })
                    }
                    deleteSiteData()
                }}
            >
                Remove
            </div> :
            null
        }
        <div className="cancel-cnt"
            onClick={()=>{
                setShowTimeLimitInput(false)
            }}
        >
            Cancel
        </div>
    </div>
    
    )
}

export default TimeLimitInput