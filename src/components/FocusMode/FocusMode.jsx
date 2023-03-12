import BlockedSitesList from '../BlockSites/BlockedSitesList';
import './FocusMode.scss';

import { ImCheckboxUnchecked as UncheckedIcon, ImCheckboxChecked as CheckedIcon } from "react-icons/im"

import { FiPlus } from "react-icons/fi"
import { BsArrowRight, BsCalendarCheckFill } from "react-icons/bs"
import { RiDeleteBin6Line } from "react-icons/ri"
import { ImBlocked } from "react-icons/im"
import { BiMemoryCard as SaveIcon } from "react-icons/bi"
import { useEffect } from 'react';

import DescisionYesNoPopup from '../PopupScreen/DecisionYesNoPopup';

const FocusMode = ()=>{
    
    // ! Debug
    const hostname = 'blog.logrocket.com'

    const handleSelectAllClicked = () =>{

    }
    const handleUnselectAllClicked = ()=>{

    }

    const handleSaveClicked = ()=>{

    }

    const decisionYesNoPopupData = {
        heading: 'Delete Schedule', 
        desc: 'Do you want to delete the schedule?',
        yesBtnTitle: 'Yes',
        noBtnTitle: 'No'
    }

    return (
        <div className="focus-mode-cnt">
            
            <DescisionYesNoPopup 
                data={decisionYesNoPopupData}
            />
            <div className="start-stop cnt">
                <button className='start-stop btn'>
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
                <div className='add-btn-cnt' title='Add new Schedule'>
                    <FiPlus />
                </div>
                <div className="schedule-list">
                    <div className="schedule-item">
                        <div className="delete-cnt">
                            <RiDeleteBin6Line />
                        </div>
                        <div className="zero-cnt">
                            <div className="toggle-cnt">
                                <input type="checkbox" checked id="switch-1" /><label for="switch-1">Toggle</label>
                            </div>
                            <div className="desc">
                                Schedule - 1
                            </div>
                            <div className="status active">
                                Active Now
                            </div>
                        </div>
                        <div className="first-cnt time-cnt">

                            <div className="inner-cnt start">
                                <div className="desc">
                                    Starts At
                                </div>
                                <hr className='line'/>
                                <div className="start time">
                                    12:00 AM
                                </div>
                            </div>
                            <div className="arrow-cnt">
                                <BsArrowRight />
                            </div>
                            <div className="inner-cnt  end">
                                <div className="desc">
                                    Ends At
                                </div>
                                <hr className='line'/>
                                <div className="end time">
                                    05:00 PM
                                </div>
                            </div>

                        </div>
                        <div className="second-cnt">

                            <div className="day-cnt">
                                <span className="day">S</span>
                                <span className="day active">M</span>
                                <span className="day active">T</span>
                                <span className="day active">W</span>
                                <span className="day">T</span>
                                <span className="day active">F</span>
                                <span className="day">S</span>
                            </div>

                        </div>
                    </div>
                    <div className="schedule-item deactive">
                        <div className="delete-cnt">
                            <RiDeleteBin6Line />
                        </div>
                        <div className="zero-cnt">
                            <div className="toggle-cnt">
                                <input type="checkbox" id="switch-2" /><label for="switch-2">Toggle</label>
                            </div>
                            <div className="desc">
                                Schedule - 2
                            </div>
                            <div className="status inactive">
                                {/* Inactive */}
                            </div>
                        </div>
                        <div className="first-cnt time-cnt">

                            <div className="inner-cnt start">
                                <div className="desc">
                                    Starts At
                                </div>
                                <hr className='line'/>
                                <div className="start time">
                                    12:00 AM
                                </div>
                            </div>
                            <div className="arrow-cnt">
                                <BsArrowRight />
                            </div>
                            <div className="inner-cnt  end">
                                <div className="desc">
                                    Ends At
                                </div>
                                <hr className='line'/>
                                <div className="end time">
                                    05:00 PM
                                </div>
                            </div>

                        </div>
                        <div className="second-cnt">

                            <div className="day-cnt">
                                <span className="day">S</span>
                                <span className="day active">M</span>
                                <span className="day active">T</span>
                                <span className="day active">W</span>
                                <span className="day">T</span>
                                <span className="day active">F</span>
                                <span className="day">S</span>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
            <div className="focus-blocked-sites-cnt">
                <div className="sticky">
                    <div className='heading'> 
                        <ImBlocked />
                        <h3>Focus Blocked Sites</h3>
                    </div>
                    <div className="btn-cnt">
                        <button
                            onClick={()=>handleSelectAllClicked()}
                        >   
                            <CheckedIcon />
                            <div>
                                Select all
                            </div>
                        </button>
                        <button
                            onClick={()=>handleUnselectAllClicked()}
                        >
                            <UncheckedIcon />
                            <div>
                                Unselect all
                            </div>
                        </button>
                        <button 
                            onClick={()=>handleSaveClicked()}
                            // className={isUnsaved ? 'un-saved' : 'saved'}
                        >
                            <SaveIcon />
                            <div>
                                {/* {isUnsaved ? 'Not Saved' : 'Saved'} */}
                                Saved
                            </div>
                        </button>
                    </div>
                </div>
                <table className="blocked-site-table">
                    <tr key={0}>
                        <td>
                            <input type="checkbox" checked/>
                        </td>
                        <td>
                            <img src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} alt="icon" />
                        </td>
                        <td className="site"> {hostname} </td>
                    </tr>
                    <tr key={1}>
                        <td>
                            <input type="checkbox" checked/>
                        </td>
                        <td>
                            <img src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} alt="icon" />
                        </td>
                        <td className="site"> {hostname} </td>
                    </tr>
                    <tr key={2}>
                        <td>
                            <input type="checkbox" checked/>
                        </td>
                        <td>
                            <img src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} alt="icon" />
                        </td>
                        <td className="site"> {hostname} </td>
                    </tr>
                    <tr key={3}>
                        <td>
                            <input type="checkbox" checked/>
                        </td>
                        <td>
                            <img src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} alt="icon" />
                        </td>
                        <td className="site"> {hostname} </td>
                    </tr>
                    <tr key={4}>
                        <td>
                            <input type="checkbox" checked/>
                        </td>
                        <td>
                            <img src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} alt="icon" />
                        </td>
                        <td className="site"> {hostname} </td>
                    </tr>
                    <tr key={5}>
                        <td>
                            <input type="checkbox" checked/>
                        </td>
                        <td>
                            <img src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} alt="icon" />
                        </td>
                        <td className="site"> {hostname} </td>
                    </tr>
                    <tr key={6}>
                        <td>
                            <input type="checkbox" checked/>
                        </td>
                        <td>
                            <img src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} alt="icon" />
                        </td>
                        <td className="site"> {hostname} </td>
                    </tr>
                    <tr key={7}>
                        <td>
                            <input type="checkbox" checked/>
                        </td>
                        <td>
                            <img src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} alt="icon" />
                        </td>
                        <td className="site"> {hostname} </td>
                    </tr>
                    <tr key={8}>
                        <td>
                            <input type="checkbox" checked/>
                        </td>
                        <td>
                            <img src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} alt="icon" />
                        </td>
                        <td className="site"> {hostname} </td>
                    </tr>
                    <tr key={9}>
                        <td>
                            <input type="checkbox" checked/>
                        </td>
                        <td>
                            <img src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} alt="icon" />
                        </td>
                        <td className="site"> {hostname} </td>
                    </tr>
                </table>

            </div>
        </div>
    )
}

export default FocusMode
