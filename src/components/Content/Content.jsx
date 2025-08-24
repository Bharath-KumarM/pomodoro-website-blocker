import styles from "./Content.module.scss"

// Icons
import {ImBlocked as BlockIcon} from "react-icons/im"
import {RiFocus2Line as FocusModeIcon} from "react-icons/ri"
import {MdTimer as ScreenTimeIcon} from "react-icons/md"
import { MdSpaceDashboard as DashboardIcon} from "react-icons/md";


// Components 
import NavOpts from "../NavOpt/NavOpts"
// import Pomodoro from "./Pomodoro/Pomodoro"
import ScreenTime from "./ScreenTime/ScreenTime"
import { BlockSites } from "./BlockSites/BlockSites"
import FocusMode from "./FocusMode/FocusMode"
import Setting from "./Setting/Setting"
import Loader from "../../utilities/Loader"
import Dashboard from "./Dashboard/Dashboard"
import { useEffect, useRef, useState } from "react";
import { ContentScrollCntEleRefContext } from "../context";



const navOptionData = [ 
    ['dashboard', 'Dashboard', DashboardIcon],
    ['block-site', 'Block Site', BlockIcon],
    ['focus-mode', 'Focus Mode', FocusModeIcon],
    ['screen-time', 'Screen Time', ScreenTimeIcon],
] 

const Content = ({navSelect, setNavSelect})=>{
    const scrollCntEleRef = useRef(null)
    const [searchText, setSearchText] = useState(null)

    const navOptElements = navOptionData.map((details, index)=>{
        return (
            <NavOpts 
                key={index}
                setNavSelect={setNavSelect}
                navSelect={navSelect}
                details={details}
            />
        )
    })

    return (
        <div className={styles.Cnt}>
            <div className={styles.ContentCnt}>
                <div 
                    className={styles.ContentScrollCnt}
                    ref={scrollCntEleRef}
                >
                    <ContentScrollCntEleRefContext.Provider value={scrollCntEleRef}>
                        {
                            navSelect.startsWith('dashboard') ? <Dashboard /> :
                            // navSelect === 'pomodoro' ? <Pomodoro /> :
                            navSelect.startsWith('focus-mode') ?
                            <FocusMode 
                                setNavSelect={setNavSelect}  
                                searchText={searchText}
                                setSearchText={setSearchText}
                            /> :
                            navSelect.startsWith('screen-time') ? 
                            <ScreenTime 
                                setNavSelect={setNavSelect}
                                searchText={searchText}
                                setSearchText={setSearchText}
                            /> : 
                            navSelect.startsWith('setting') ? 
                                <Setting 
                                    setNavSelect={setNavSelect}
                                /> :
                            navSelect.startsWith('block-site') ? 
                                <BlockSites 
                                    setNavSelect={setNavSelect} 
                                    searchText={searchText}  
                                    setSearchText={setSearchText}
                                /> : 

                            <Loader />
                        }
                    </ContentScrollCntEleRefContext.Provider>
                </div>
                <input 
                    type="text" 
                    className={styles.SitesSearch}
                    placeholder={'Search sites🔍'}
                    onChange={(e)=>{
                        setSearchText(e.target.value?.toLocaleLowerCase())
                        // scrollCntEleRefContext.current.scrollTo(0, 0)
                        scrollCntEleRef.current.scrollTo(0, 0)
                    }}
                    value={searchText && searchText.toLocaleLowerCase()}
                    onFocus={()=>{
                        setSearchText('')
                        // listEleRef.current.scrollIntoView()
                    }}        
                    onBlur={()=>{
                        setSearchText('')
                    }}
                />
            </div>
            <nav className={styles.Nav}>
                {navOptElements}
            </nav>
        </div>
    )
}

export default Content