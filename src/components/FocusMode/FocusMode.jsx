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

    const [decisionScreenData, setDecisionScreenData] = useState(null) // *Simple Yes or no decision screen
    const [toastData, setToastData] = useState([null, null]) //* Toast Message from bottom

    const [scheduleTimeBtwNos, setScheduleTimeBtwNos] = useState(null)

    const isTimeInputActive = editTimeInputIndex > -1
    const isDecisionScreenDataThere = decisionScreenData !== null

    const shouldPopScreenOpen = [isTimeInputActive, isDecisionScreenDataThere].includes(true)

    const [toastMsg, toastColorCode] = toastData

    const getScheduleTimeBtwNos = () =>{
        getIsTimeBtwFocusSchedule().then((tempScheduleTimeBtwNos)=>setScheduleTimeBtwNos(tempScheduleTimeBtwNos))
    }

    const getScheduleData = ()=>{
        //* Get schedule data
        chrome.storage.local.get('scheduleData', ({scheduleData: tempScheduleData})=>{
            if (tempScheduleData) setScheduleData(tempScheduleData)
            else chrome.storage.local.set({'scheduleData': []})
        })

        // *  Updates 
        getScheduleTimeBtwNos()
    }
    useEffect(()=>{
        getScheduleData()
        
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
                    setToastData(['Focus Mode Started', 'green'])
                    setIsFocusModeOn(isCurrFocusModeOn)
                })
            }
            else {
                turnOffFocusMode().then(()=>{
                    setToastData(['Focud Mode Stoped', 'red'])
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
                    toastData[0] ?
                    <PopupToast 
                        key={'popup-toast'}
                        toastMsg={toastMsg}
                        toastColorCode={toastColorCode}
                        setToastData={setToastData}
                    /> : null
                }
                {
                    shouldPopScreenOpen ? 
                    // Popup Screen
                    <PopupFull 
                        setClosePopup={()=> {
                            if (decisionScreenData){
                                const {onNoBtnClick} = decisionScreenData
                                onNoBtnClick()
                            }else{
                                setEditTimeInputIndex(-1)
                            }
                        }}
                        content={
                            isTimeInputActive ?
                            <TimeInputPopup 
                                getScheduleData={getScheduleData}
                                editTimeInputIndex={editTimeInputIndex}
                                setEditTimeInputIndex={setEditTimeInputIndex}
                                isNewSchedule={(editTimeInputIndex === scheduleData.length)}
                                setToastData={setToastData}
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
                            foucsModeBreakTimeDiff ? "💤You took a break"  :
                            isFocusModeOn === false ? '🏃🏼‍♂️Start Focus Mode': 
                            isFocusModeOn === true ? '🚫Stop Focus Mode' :
                            'Loading'
                        }
                    </button>
                    <>
                        {
                            !foucsModeBreakTimeDiff ? null :
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

                                    setToastData(['Focus Mode resumed', 'green'])
                                }}
                            >
                                Resume now
                            </div>
                        }
                        {
                            !foucsModeBreakTimeDiff && !scheduleTimeBtwNos ? null :
                            <div className='break-cnt flex-center'>
                                <div className="info-icon-cnt">
                                    <BiInfoCircle />
                                </div>
                                <div className="desc">
                                    {   
                                        !foucsModeBreakTimeDiff && scheduleTimeBtwNos ?
                                        `Scheduled focus is active now` :
                                        scheduleTimeBtwNos ? 
                                        `Schedule resumes in ${foucsModeBreakTimeDiff} minutes` :
                                        `Focus Mode resumes in ${foucsModeBreakTimeDiff} minutes`
                                    }
                                </div>
                            </div>
                        }

                    </>
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
                                    getScheduleData={getScheduleData}
                                    setEditTimeInputIndex={setEditTimeInputIndex}
                                    setDecisionScreenData={setDecisionScreenData}
                                    setToastData={setToastData}
                                    key={index}
                                    scheduleTimeBtwNos={scheduleTimeBtwNos}
                                />
                            ) 
                        })}
                    </div>

                </div>
                <RestrictedSites 
                    setToastData={setToastData}
                />
            </div>
        </div>
    )
}

export default FocusMode


const ScheduleItem = ({scheduleItemData, index, getScheduleData, setEditTimeInputIndex, setDecisionScreenData, setToastData, scheduleTimeBtwNos})=>{
    const [isScheduleItemAtive, setIsScheduleItemAtive] = useState(false)

    useEffect(()=>{
            if (scheduleTimeBtwNos && scheduleTimeBtwNos.includes(index)){
                setIsScheduleItemAtive(true)
            }
            else{
                setIsScheduleItemAtive(false)
            }
    }, [scheduleItemData])

    const onNoBtnClick = ()=>{
        setDecisionScreenData(null)
    }

    const onYesBtnClick = async ()=>{
        const {scheduleData} =  chrome.storage.local.get('scheduleData')
        const newScheduleData = scheduleData.filter((val, i)=> i!=index)

        await chrome.storage.local.set({scheduleData: [...newScheduleData]})

        getScheduleData()
        setToastData(['The schedule has been deleted', 'red'])
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