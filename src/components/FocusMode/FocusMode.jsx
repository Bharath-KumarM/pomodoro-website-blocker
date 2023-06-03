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
import { getScheduleItemDesc, getActiveFocusScheduledIndexes } from '../../utilities/focusModeHelper';
import { delLocalScheduleDataByIndex, getLocalScheduleData } from '../../localStorage/localScheduleData';
import { getLocalFocusModeTracker, turnOffLocalFocusModeTracker, turnOnLocalFocusModeTracker } from '../../localStorage/localFocusModeTracker';
import { getLocalTakeABreakTrackerforRestrict, turnOffLocalTakeABreakTrackerforRestrict } from '../../localStorage/localTakeABreakTrackerforRestrict';



const FocusMode = ()=>{
    const [scheduleData, setScheduleData] = useState([])
    const [isFocusModeOn, setIsFocusModeOn] = useState(null)
    const [foucsModeBreakTimeDiff, setFoucsModeBreakTimeDiff] = useState(false)
    const [editTimeInputIndex, setEditTimeInputIndex] = useState(-1) //-1 means nothing to edit

    const [decisionScreenData, setDecisionScreenData] = useState(null) // *Simple Yes or no decision screen
    const [toastData, setToastData] = useState([null, null]) //* Toast Message from bottom

    const [activeFocusScheduledIndexes, setActiveFocusScheduledIndexes] = useState([])

    const isTimeInputActive = editTimeInputIndex > -1
    const isDecisionScreenDataThere = decisionScreenData !== null

    const shouldPopScreenOpen = [isTimeInputActive, isDecisionScreenDataThere].includes(true)

    const [toastMsg, toastColorCode] = toastData

    const getScheduleData = async ()=>{
        // Get schedule data
        const {scheduleData: tempScheduleData} = await getLocalScheduleData()
        setScheduleData(tempScheduleData)

        const tempActiveFocusScheduledIndexes = await getActiveFocusScheduledIndexes()
        setActiveFocusScheduledIndexes(tempActiveFocusScheduledIndexes)
    }
    const gettakeABreakTrackerforRestrictData = async ()=>{
        // Take a break
        const {takeABreakTrackerforRestrict} = await getLocalTakeABreakTrackerforRestrict()

        if (takeABreakTrackerforRestrict !== undefined){
            if (takeABreakTrackerforRestrict === false) setFoucsModeBreakTimeDiff(false)
            else{
                const newTimeDiff = Math.ceil((takeABreakTrackerforRestrict - new Date().getTime())/(1000*60))
                setFoucsModeBreakTimeDiff(newTimeDiff)
            }
        } 
    }
    useEffect(()=>{
        getScheduleData()
        gettakeABreakTrackerforRestrictData()


        // Focus mode tracker
        getLocalFocusModeTracker().
            then(({focusModeTracker})=>{
                setIsFocusModeOn(Boolean(focusModeTracker))
        })

    }, [])


    const handleFocusModeBtnClick = ()=>{
        if (!foucsModeBreakTimeDiff){ 
            const isCurrFocusModeOn = !isFocusModeOn
            if (isCurrFocusModeOn) {
                turnOnLocalFocusModeTracker().then(()=>{
                    setToastData(['Focus Mode Started', 'green'])
                    setIsFocusModeOn(isCurrFocusModeOn)
                })
            }
            else {
                turnOffLocalFocusModeTracker().then(()=>{
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
                    >
                        {
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
                    </PopupFull> : null
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
                                onClick={async ()=>{
                                    // forcfully turning off
                                    await turnOffLocalTakeABreakTrackerforRestrict(false)
                                    if (isFocusModeOn) {
                                        setToastData(['Focus Mode resumed', 'green'])
                                    } else {
                                        setToastData(['Scheduled restict resumed', 'green'])
                                    }

                                    setFoucsModeBreakTimeDiff(false)
                                }}
                            >
                                Resume now
                            </div>
                        }
                        {
                            !foucsModeBreakTimeDiff && !activeFocusScheduledIndexes.length ? null :
                            <div className='break-cnt flex-center'>
                                <div className="info-icon-cnt">
                                    <BiInfoCircle />
                                </div>
                                <div className="desc">
                                    {   
                                        !foucsModeBreakTimeDiff && activeFocusScheduledIndexes.length ?
                                        `Scheduled focus is active now` :
                                        activeFocusScheduledIndexes.length ? 
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
                                    activeFocusScheduledIndexes={activeFocusScheduledIndexes}
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


const ScheduleItem = ({scheduleItemData, index, getScheduleData, setEditTimeInputIndex, setDecisionScreenData, setToastData, activeFocusScheduledIndexes})=>{
    const [isScheduleItemAtive, setIsScheduleItemAtive] = useState(activeFocusScheduledIndexes.includes(index))

    console.log(activeFocusScheduledIndexes)
    useEffect(()=>{
            if (activeFocusScheduledIndexes.includes(index)) setIsScheduleItemAtive(true)
            else setIsScheduleItemAtive(false)

    }, [scheduleItemData, activeFocusScheduledIndexes])

    const onNoBtnClick = ()=>{
        setDecisionScreenData(null)
    }

    const onYesBtnClick = async ()=>{
        const isScheduleDataDeleted = await delLocalScheduleDataByIndex(index)

        if (isScheduleDataDeleted) setToastData(['The schedule has been deleted', 'red'])
        else setToastData(['Error: The schedule not found', 'red'])

        getScheduleData()
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
                        {`Schedule ${index+1} ${isScheduleItemAtive ? '- Active ' : ''}`}
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