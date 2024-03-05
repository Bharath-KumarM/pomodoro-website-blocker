import './FocusMode.scss';

import { PopupFull, PopupToast } from '../../../utilities/PopupScreens';
import DescisionYesNoPopup from '../../../utilities/DecisionYesNoPopup';
import TimeInputPopup from '../../../utilities/TimeInputPopup';
import { useEffect, useState } from 'react';

// Icons
import { FiPlus } from "react-icons/fi"
import { BsCalendarCheckFill } from "react-icons/bs"
import { RiDeleteBin6Line } from "react-icons/ri"
import { HiClock } from "react-icons/hi"
import { BiInfoCircle } from "react-icons/bi"

import RestrictedSites from './RestrictedSites';
import { getScheduleItemDesc, getActiveFocusScheduledIndexes } from '../../../utilities/focusModeHelper';
import { delLocalScheduleDataByIndex, getLocalScheduleData } from '../../../localStorage/localScheduleData';
import { getLocalFocusModeTracker, turnOffLocalFocusModeTracker, turnOnLocalFocusModeTracker } from '../../../localStorage/localFocusModeTracker';
import { getLocalTakeABreakTrackerforRestrict, handleTakeABreakClick, turnOffLocalTakeABreakTrackerforRestrict } from '../../../localStorage/localTakeABreakTrackerforRestrict';
import Loader from '../../../utilities/Loader';
import NavBar from '../NavBar/NavBar';



const FocusMode = ({setNavSelect})=>{
    const [scheduleData, setScheduleData] = useState([])
    const [isFocusModeOn, setIsFocusModeOn] = useState(null)
    const [foucsModeBreakTimeDiff, setFoucsModeBreakTimeDiff] = useState(false)
    const [editTimeInputIndex, setEditTimeInputIndex] = useState(-1) //-1 means nothing to edit

    const [decisionScreenData, setDecisionScreenData] = useState(null) // *Simple Yes or no decision screen
    const [toastData, setToastData] = useState([null, null]) //* Toast Message from bottom

    const [activeFocusScheduledIndexes, setActiveFocusScheduledIndexes] = useState([])

    const isTimeInputActive = editTimeInputIndex > -1
    const [dataLoadedStatus, setDataLoadedStatus] = useState({
        scheduleData: false,
        isFocusModeOn: false,
        foucsModeBreakTimeDiff: false,
        activeFocusScheduledIndexes: false,
    })


    const isDecisionScreenDataThere = decisionScreenData !== null
    const isPopScreenOpen = [editTimeInputIndex > -1, isDecisionScreenDataThere].includes(true)

    const [toastMsg, toastColorCode] = toastData

    const getScheduleData = async ()=>{
        // Get schedule data
        const {scheduleData: tempScheduleData} = await getLocalScheduleData()
        setScheduleData(tempScheduleData)
        
        setDataLoadedStatus(prevDataLoadedStatus => ({...prevDataLoadedStatus, scheduleData: true}))
        const tempActiveFocusScheduledIndexes = await getActiveFocusScheduledIndexes()
        setActiveFocusScheduledIndexes(tempActiveFocusScheduledIndexes)
        setDataLoadedStatus(prevDataLoadedStatus => ({...prevDataLoadedStatus, activeFocusScheduledIndexes: true}))
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
            setDataLoadedStatus(prevDataLoadedStatus => ({...prevDataLoadedStatus, foucsModeBreakTimeDiff: true}))
        } 
    }
    const getFocusMode = async ()=>{
        const {focusModeTracker} = await getLocalFocusModeTracker()
        setIsFocusModeOn(Boolean(focusModeTracker))
        setDataLoadedStatus(prevDataLoadedStatus => ({...prevDataLoadedStatus, isFocusModeOn: true}))
    }

    useEffect(()=>{
        getScheduleData()
        gettakeABreakTrackerforRestrictData()
        getFocusMode()

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
        Object.values(dataLoadedStatus).includes(false) ? 
        <Loader /> :
        <>
            <NavBar 
                setNavSelect={setNavSelect}
                navDetailsArr={[['Focus Mode', 'focus-mode']]}
            />
            <div className="focus-mode-outer-cnt">
                <div className="focus-mode-cnt">
                    {
                        toastData[0] ?
                        <PopupToast 
                            key={'popup-toast'}
                            toastData={toastData}
                            setToastData={setToastData}
                        /> : null
                    }
                    {
                        isPopScreenOpen ? 
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
                        
                        </PopupFull> 
                        : null
                    }
                    <div className="start-stop cnt flex-center">
                        <div className='start-stop-btn-cnt'>
                            <button 
                                className = {
                                    `start-stop btn ${foucsModeBreakTimeDiff ? 'focus-break-active' : isFocusModeOn ? 'focused' : '' }`
                                }
                                onClick={()=>handleFocusModeBtnClick()}
                            >
                                {
                                    foucsModeBreakTimeDiff ? "💤You took a break"  :
                                    isFocusModeOn === false ? '✨Start focusing': 
                                    isFocusModeOn === true ? '🚫Stop focusing' :
                                    'Loading'
                                }
                            </button>
                        </div>
                        <>
                            {
                                foucsModeBreakTimeDiff || activeFocusScheduledIndexes.length || isFocusModeOn ?
                                <div className='break-cnt flex-center'>
                                    <div className="info-icon-cnt">
                                        <BiInfoCircle />
                                    </div>
                                    <div className="desc">
                                        {   
                                            // take a break description
                                            foucsModeBreakTimeDiff && activeFocusScheduledIndexes.length ?
                                            `Schedule resumes in ${foucsModeBreakTimeDiff} minutes` :
                                            foucsModeBreakTimeDiff && !activeFocusScheduledIndexes.length ?
                                            `Focus Mode resumes in ${foucsModeBreakTimeDiff} minutes` :

                                            // Focus active description
                                            isFocusModeOn && activeFocusScheduledIndexes.length ?
                                            `Focus mode & Schedule active` :
                                            activeFocusScheduledIndexes.length ?
                                            `Scheduled focus is active now` :
                                            isFocusModeOn ?
                                            'Focus mode is ON' :
                                            
                                            // Focus inactive description
                                            null
                                        }
                                    </div>
                                </div> : 
                                null
                            }
                            {
                                !foucsModeBreakTimeDiff ? null :
                                <div className="option-cnt">
                                    <div className="resume-cnt"
                                        onClick={async ()=>{
                                            // forcfully turning off
                                            turnOffLocalTakeABreakTrackerforRestrict({isForceTurnOff: true, shouldRefreshSites: true})
                                            if (isFocusModeOn) {
                                                setToastData(['Focus Mode resumed', 'green'])
                                            } else {
                                                setToastData(['Scheduled restict resumed', 'green'])
                                            }

                                            setFoucsModeBreakTimeDiff(false)
                                            window.close()
                                        }}
                                    >
                                        Resume focus now
                                    </div>
                                    <hr />
                                    <div className="wait-cnt"
                                        onClick={async ()=>{
                                            await turnOffLocalTakeABreakTrackerforRestrict({isForceTurnOff: true, shouldRefreshSites: false})
                                            await handleTakeABreakClick(foucsModeBreakTimeDiff + 5)
                                            window.close()
                                        }}
                                    >
                                        Wait for 5 more minutes
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
                                        setToastData={setToastData}
                                        key={index}
                                        activeFocusScheduledIndexes={activeFocusScheduledIndexes}
                                        setDecisionScreenData={setDecisionScreenData}
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
        </>
    )
}

export default FocusMode


const ScheduleItem = ({scheduleItemData, index, getScheduleData, setEditTimeInputIndex, setToastData, activeFocusScheduledIndexes, setDecisionScreenData})=>{
    const [isScheduleItemAtive, setIsScheduleItemAtive] = useState(activeFocusScheduledIndexes.includes(index))

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
        <div className={`schedule-item compact ${isScheduleItemAtive ? 'active' : ''}`}
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