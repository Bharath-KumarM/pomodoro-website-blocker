import './EditTimeLimit.scss'

import { BiTime } from "react-icons/bi"
import { RiCloseLine } from 'react-icons/ri'

import { pad2 } from '../../../utilities/simpleTools'
import { useContext, useEffect, useState } from 'react'
import { PopupFull } from '../../../utilities/PopupScreens'
import { getScreenTimeLimit, handleScreenTimeLimtUpdate } from '../../../localStorage/localSiteTagging'
import { LocalFavIconUrlDataContext } from '../../context'


const hrValues = Array.from({length: 24}, (_ ,index)=>pad2(index))
const minValues = Array.from({length: 12}, (_ ,index)=>pad2(index*5))

const EditTimeLimit = ({hostname, setScreenTimeLimit, setToastData, setClosePopup})=>{
    const [hours, setHours] = useState(0)
    const [minutes, setMinutes] = useState(30)
    const [isLimited, setIsLimited] = useState(false)
    const localFavIconUrlData = useContext(LocalFavIconUrlDataContext)
    const getFavIcon = (hostname)=>{
        return localFavIconUrlData[hostname] || getFavIconUrlFromGoogleApi(hostname)
    }

    useEffect(()=>{
        const getData = async ()=>{

            let screenTimeLimitOfHostname = await getScreenTimeLimit(hostname)
            
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

        <PopupFull
            setClosePopup={setClosePopup}
        >
            <div className='time-limit-input-popup-cnt'
                onClick={e=>e.stopPropagation()}
            >
                <button 
                    className='close btn'
                    onClick={setClosePopup}
                >
                    <RiCloseLine />
                </button>
                <h2 className="heading">
                    Set Time Limit 
                </h2>
                <div className="site-info">
                    <img className='site-icon' 
                        src={getFavIcon(hostname)} 
                        alt={hostname}
                    />
                    <span className='hostname'>
                        {hostname}
                    </span>  
                </div>
                <div className="time-input-cnt">
                        <select 
                            id="time-hr" 
                            className='time-input hr'
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
                    onClick={async (e)=>{
                        const [tempHours, tempMinutes] = [parseInt(hours), parseInt(minutes)]
                        if (tempHours === 0 && tempMinutes === 0){
                            setToastData(['Zero minutes can\'t be set', 'red']) 
                            
                            setClosePopup()
                            setScreenTimeLimit(await getScreenTimeLimit())

                            return null;
                        }
                        const storeData = async ()=>{
                            await handleScreenTimeLimtUpdate({
                                hostname,
                                timeLimitData: [tempHours, tempMinutes],
                                shouldAddTimeLimit: true,
                                setToastData
                            })
                            
                            setClosePopup()
                            setScreenTimeLimit(await getScreenTimeLimit())
                        }

                        storeData()
                    }}

                />
                {
                    isLimited ?
                    <div className="remove-cnt"
                        onClick={async ()=>{
                            await handleScreenTimeLimtUpdate({
                                hostname,
                                shouldAddTimeLimit: false,
                                setToastData
                            })

                            setClosePopup()
                            setScreenTimeLimit(await getScreenTimeLimit())
                            
                        }}
                    >
                        Remove
                    </div> :
                    null
                }
                <div className="cancel-cnt"
                    onClick={setClosePopup}
                >
                    Cancel
                </div>
            </div>
        </PopupFull>
    
    )
}

export default EditTimeLimit