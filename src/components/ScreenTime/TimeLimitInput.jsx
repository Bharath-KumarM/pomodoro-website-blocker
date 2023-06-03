import './TimeLimitInput.scss'

import { BiInfoCircle, BiTime } from "react-icons/bi"
import { RiCloseLine } from 'react-icons/ri'

import { pad2 } from '../../utilities/simpleTools'
import { useEffect, useState } from 'react'
import {  getIsScreenTimeSurpassedLimit } from '../../utilities/chrome-tools/chromeApiTools'
import { refreshAllTabsByHostname, refreshAllTimeLimitScreenTabs } from "../../utilities/chrome-tools/refreshTabs"
import { delLocalScreenTimeLimit, getLocalScreenTimeLimit, getLocalScreenTimeLimitByHostname, updateLocalScreenTimeLimit } from '../../localStorage/localScreenTimeLimit'


const hrValues = Array.from({length: 24}, (_ ,index)=>pad2(index))
const minValues = Array.from({length: 12}, (_ ,index)=>pad2(index*5))

const TimeLimitInput = ({showTimeLimitInput: hostname, setShowTimeLimitInput, setScreenTimeLimit, setToastMsg})=>{
    const [hours, setHours] = useState(0)
    const [minutes, setMinutes] = useState(30)
    const [isLimited, setIsLimited] = useState(false)

    useEffect(()=>{
        const getData = async ()=>{

            let screenTimeLimitOfHostname = await getLocalScreenTimeLimitByHostname(hostname)
            
            // Time Limit is unavailable
            if (!screenTimeLimitOfHostname) return;
            
            const [tempHour, tempMinute] = screenTimeLimitOfHostname
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
        <div className="site-info">
            <img className='site-icon' 
                src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} 
                alt="icon" 
            />
            <span className='hostname'>
                {hostname}
            </span>  
        </div>
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
                    await updateLocalScreenTimeLimit(hostname, [parseInt(hours), parseInt(minutes)])

                    setShowTimeLimitInput(false)
                    setScreenTimeLimit(null)

                }
                storeData()
                setToastMsg('Screen time set')
            }}

        />
        {
            isLimited ?
            <div className="remove-cnt"
                onClick={async ()=>{
                    const isScreenTimeLimitDeleted = delLocalScreenTimeLimit(hostname);

                    if (isScreenTimeLimitDeleted) setToastMsg('Time limit removed');
                    else setToastMsg('Time limit never exist');

                    setShowTimeLimitInput(false);
                    setScreenTimeLimit(null);
                    
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