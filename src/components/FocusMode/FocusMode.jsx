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

import RestrictedSites from './RestrictedSites';



const FocusMode = ()=>{
    const [scheduleData, setScheduleData] = useState([])
    const [editTimeInputIndex, setEditTimeInputIndex] = useState(-1) //-1 means nothing to edit

    const [decisionScreenData, setDecisionScreenData] = useState(null) //Simple Yes or no decision screen


    const [toastMsg, setToastMsg] = useState(null)

    const isTimeInputActive = editTimeInputIndex > -1
    const isDecisionScreenDataThere = decisionScreenData !== null

    const shouldPopScreenOpen = [isTimeInputActive, isDecisionScreenDataThere].includes(true)

    useEffect(()=>{
        chrome.storage.local.get('scheduleData', ({scheduleData})=>{
            if (scheduleData) setScheduleData(scheduleData)
        })
    }, [])
    


    const handleSelectAllClicked = () =>{

    }
    const handleUnselectAllClicked = ()=>{

    }

    const handleSaveClicked = ()=>{

    }

    return (
        <div className="focus-mode-cnt">
            <PopupToast 
                key={'popup-toast'}
                toastMsg={toastMsg}
            />
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
            <div className="start-stop cnt">
                <button className='start-stop btn'
                onClick={()=>{
                    setToastMsg(['start button clicked!'])
                }}
                >
                    Start Focus Mode
                </button>
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
                            />
                        ) 
                    })}
                </div>

            </div>
            <RestrictedSites />
        </div>
    )
}

export default FocusMode


const ScheduleItem = ({scheduleItemData, index, setScheduleData, setEditTimeInputIndex, setDecisionScreenData, setToastMsg})=>{
    const [startTime, endTime, days] = scheduleItemData
    const [startHr, startMin, startAmPM] = startTime.split(':')
    const [endHr, endMin, endAmPM] = endTime.split(':')

    const daysString3 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const getDayDesc = (days)=>{
        if (!days.includes(false)) return 'everyday'
        let daysDesc = ''
        for (let i=0; i<days.length; i++){
            if (days[i]){
                daysDesc += (daysString3[i] + ' ')
            }
        }
        return daysDesc
    }

    const daysDesc = getDayDesc(days)

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
            <div className="clock-icon-cnt style-index-center">
                <HiClock />
            </div>
            <div className="content">
                <h3 className="content-heading">
                    {'Schedule '+(index+1)}
                </h3>
                <div className="desc">
                    {`From ${startHr}:${startMin} ${startAmPM} to ${endHr}:${endMin} ${endAmPM} on ${daysDesc}`}
                </div>
            </div>
            <div className="delete-icon-cnt style-index-center"
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