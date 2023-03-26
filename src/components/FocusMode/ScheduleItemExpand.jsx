import './ScheduleItemExpand.scss';

const ScheduleItmeExpand = ()=>{

    //! Scraped code. Might use later
    return (
        <>
            <div className="schedule-item expand">
                <div className="delete-cnt">
                    <RiDeleteBin6Line />
                </div>
                <div className="zero-cnt">
                    <div className="toggle-cnt">
                        <input type="checkbox" checked id="switch-1" /><label for="switch-1">Toggle</label>
                    </div>
                    {/* <div className="desc">
                        Schedule - 1
                    </div> */}
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
                            <div className="text">
                                12:00 AM
                            </div>
                            <BiTime />
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
                            <div className="text">
                                12:00 AM
                            </div>
                            <BiTime />
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
            <div className="schedule-item expand deactive">
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
        </>
    )
}

export default ScheduleItmeExpand