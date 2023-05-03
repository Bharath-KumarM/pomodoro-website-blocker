import './FocusMode.scss';

import { PopupFull, PopupToast } from '../../utilities/PopupScreens';
import DescisionYesNoPopup from '../../utilities/DecisionYesNoPopup';
import TimeInputPopup from '../../utilities/TimeInputPopup';
import { useEffect, useState } from 'react';

// Icons
import { FiPlus } from "react-icons/fi"
import { BsCalendarCheckFill } from "react-icons/bs"
import { RiDeleteBin6Line } from "react-icons/ri"
import { HiClock } from "react-icons/hi"
import { BiInfoCircle } from "react-icons/bi"

import RestrictedSites from './RestrictedSites';
import { turnOffFocusMode, turnOnFocusMode } from '../../pages/background/restrictSiteBG';
import { getScheduleItemDesc, getIsTimeBtwFocusSchedule } from '../../utilities/focusModeHelper';



const FocusMode = ()=>{
    const [scheduleData, setScheduleData] = useState([])
    const [isFocusModeOn, setIsFocusModeOn] = useState(null)
    const [foucsModeBreakTimeDiff, setFoucsModeBreakTimeDiff] = useState(false)
    const [editTimeInputIndex, setEditTimeInputIndex] = useState(-1) //-1 means nothing to edit

    const [decisionScreenData, setDecisionScreenData] = useState(null) //Simple Yes or no decision screen
    const [toastMsg, setToastMsg] = useState(null) //* Toast Message from bottom

    const isTimeInputActive = editTimeInputIndex > -1
    const isDecisionScreenDataThere = decisionScreenData !== null

    const shouldPopScreenOpen = [isTimeInputActive, isDecisionScreenDataThere].includes(true)


    useEffect(()=>{
        //* Get schedule data
        chrome.storage.local.get('scheduleData', ({scheduleData: tempScheduleData})=>{
            if (tempScheduleData) setScheduleData(tempScheduleData)
            else chrome.storage.local.set({'scheduleData': []})
        })

        //* Take a break
        chrome.storage.local.get('focusModeTakeABreakTracker', ({focusModeTakeABreakTracker})=>{
            if (focusModeTakeABreakTracker !== undefined){
                if (focusModeTakeABreakTracker === false) setFoucsModeBreakTimeDiff(false)
                else{
                    const newTimeDiff = Math.ceil((focusModeTakeABreakTracker - new Date().getTime())/(1000*60))
                    setFoucsModeBreakTimeDiff(newTimeDiff)
                }
            } 
        })

        //* Focus mode tracker
        chrome.storage.local.get('focusModeTracker', ({focusModeTracker})=>{
            if (focusModeTracker === undefined){
                setIsFocusModeOn(false)
            }
            else{
                setIsFocusModeOn(focusModeTracker)
            }
        })

    }, [])

    const handleFocusModeBtnClick = ()=>{
        if (!foucsModeBreakTimeDiff){ 
            const isCurrFocusModeOn = !isFocusModeOn
            if (isCurrFocusModeOn) {
                turnOnFocusMode().then(()=>{
                    setToastMsg('Focus Mode Started')
                    setIsFocusModeOn(isCurrFocusModeOn)
                })
            }
            else {
                turnOffFocusMode().then(()=>{
                    setToastMsg('Focud Mode Stoped')
                    setIsFocusModeOn(isCurrFocusModeOn)
                })
            }
        }
        else{
            // * You are on break, so can't start or end focus mode
        }
    }
    return (
        <div className="focus-mode-outer-cnt">
            <div className="focus-mode-cnt">
                {
                    toastMsg ?
                    <PopupToast 
                        key={'popup-toast'}
                        toastMsg={toastMsg}
                        setToastMsg={setToastMsg}
                    /> : null
                }
                {
                    shouldPopScreenOpen ? 
                    // Popup Screen
                    <PopupFull 
                        setClosePopup={()=> setEditTimeInputIndex(-1)}
                        content={
                            isTimeInputActive ?
                            <TimeInputPopup 
                                setScheduleData={setScheduleData}
                                editTimeInputIndex={editTimeInputIndex}
                                setEditTimeInputIndex={setEditTimeInputIndex}
                                isNewSchedule={(editTimeInputIndex === scheduleData.length)}
                                setToastMsg={setToastMsg}
                            /> :
                            isDecisionScreenDataThere ?
                            <DescisionYesNoPopup 
                                data={decisionScreenData}
                            />
                            : null
                        }
                    />
                    : null
                }
                <div className="start-stop cnt flex-center">
                    <button className = {`start-stop btn ${foucsModeBreakTimeDiff ? 'focus-break-active' : ''}`}
                    onClick={()=>handleFocusModeBtnClick()}
                    >
                        {
                            foucsModeBreakTimeDiff ? "💤You're on a break"  :
                            isFocusModeOn === false ? '🏃🏼‍♂️Start Focus Mode': 
                            isFocusModeOn === true ? '🚫Stop Focus Mode' :
                            'Loading'
                        }
                    </button>
                    {
                        foucsModeBreakTimeDiff ?
                        <>
                            <div className="resume-cnt"
                                onClick={()=>{
                                    
                                    const isCurrFocusModeOn = !isFocusModeOn
                                    if (isCurrFocusModeOn) turnOnFocusMode()
                                    else turnOffFocusMode()

                                    setIsFocusModeOn(isCurrFocusModeOn)
                                    setFoucsModeBreakTimeDiff(false)

                                    chrome.storage.local.set({focusModeTakeABreakTracker: false})
                                    chrome.alarms.clear('focusModeTakeABreak', ()=>{
                                        console.log('break alarm cleared!!!')
                                    })

                                    setToastMsg('Focus Mode resumed')
                                }}
                            >
                                Resume now
                            </div>
                            <div className='break-cnt flex-center'>
                                <div className="info-icon-cnt">
                                    <BiInfoCircle />
                                </div>
                                <div className="desc">
                                    {`Focus Mode resume in ${foucsModeBreakTimeDiff} minutes`}
                                </div>
                            </div>

                        </>
                        : null
                    }
                </div>
                <div className="schedule-cnt">
                    <div className='heading sticky'>
                        <BsCalendarCheckFill />
                        <h3>
                            Schedule
                        </h3>
                    </div>
                    <div className='add-btn-cnt' 
                        title='Add new Schedule'
                        onClick={()=>setEditTimeInputIndex(scheduleData.length)}
                    >
                        <FiPlus />
                    </div>
                    <div className="schedule-list">
                        {scheduleData.map((scheduleItemData, index)=> {
                            return (
                                <ScheduleItem 
                                    scheduleItemData={scheduleItemData} 
                                    index={index} 
                                    setScheduleData={setScheduleData}
                                    setEditTimeInputIndex={setEditTimeInputIndex}
                                    setDecisionScreenData={setDecisionScreenData}
                                    setToastMsg={setToastMsg}
                                    key={index}
                                />
                            ) 
                        })}
                    </div>

                </div>
                <RestrictedSites 
                    setToastMsg={setToastMsg}
                />
            </div>
        </div>
    )
}

export default FocusMode


const ScheduleItem = ({scheduleItemData, index, setScheduleData, setEditTimeInputIndex, setDecisionScreenData, setToastMsg})=>{
    const [isScheduleItemAtive, setIsScheduleItemAtive] = useState(false)

    useEffect(()=>{
        getIsTimeBtwFocusSchedule().then((tempScheduleTimeBtwNos)=>{
            if (tempScheduleTimeBtwNos && tempScheduleTimeBtwNos.includes(index)){
                setIsScheduleItemAtive(true)
            }
            else{
                setIsScheduleItemAtive(false)
            }
        })
    }, [scheduleItemData])


    const onNoBtnClick = ()=>{
        setDecisionScreenData(null)
    }

    const onYesBtnClick = ()=>{
        chrome.storage.local.get('scheduleData', ({scheduleData})=>{
            const newScheduleData = scheduleData.filter((val, i)=> i!=index)
            
            chrome.storage.local.set({scheduleData: [...newScheduleData]})
            setScheduleData([...newScheduleData])
        })
        setToastMsg(['The schedule has been deleted'])
        setDecisionScreenData(null)
    }

    return (
        <div className="schedule-item compact"
            title='Edit Schedule'
            onClick={()=>{
                setEditTimeInputIndex(index)
            }}
        >   

            <div className="clock-icon-cnt flex-center">
                <HiClock />
            </div>
            <div className="content">
                <div className="content-heading-cnt">
                    <h3 className="content-heading">
                        {`Schedule ${index+1} ${isScheduleItemAtive ? '- Active Now' : ''}`}
                    </h3>
                    {
                        isScheduleItemAtive ?
                        <div className="active-indicator"></div> :
                        null
                    }

                </div>
                <div className="desc">
                    {getScheduleItemDesc(scheduleItemData)}
                </div>
            </div>
            <div className="delete-icon-cnt flex-center"
                title='Delete Schedule'
                onClick={(e)=>{
                    e.stopPropagation()
                    setDecisionScreenData({
                        heading: 'Delete Schedule', 
                        desc: 'Do you want to delete the schedule?',
                        yesBtnTitle: 'Yes',
                        noBtnTitle: 'No',
                        onYesBtnClick,
                        onNoBtnClick
                    })
                }}
            >
                <RiDeleteBin6Line />
            </div>
        </div>
    )
}