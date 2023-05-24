import styles from "./Content.module.scss"

import { useState } from "react"

// Icons
import {ImBlocked as BlockIcon} from "react-icons/im"
// import {GiTomato as PomodoroIcon} from "react-icons/gi"
import {RiFocus2Line as FocusModeIcon} from "react-icons/ri"
import {MdTimer as ScreenTimeIcon} from "react-icons/md"

// Components 
import NavOpts from "../NavOpt/NavOpts"
import Pomodoro from "../Pomodoro/Pomodoro"
import ScreenTime from "../ScreenTime/ScreenTime"
import BlockSites from "../BlockSites/BlockSites"
import FocusMode from "../FocusMode/FocusMode"



const navOptionData = [
    ['block-site', 'Block Site', BlockIcon],
    // ['pomodoro', 'Pomodoro', PomodoroIcon],
    ['focus-mode', 'Focus Mode', FocusModeIcon],
    ['screen-time', 'Screen Time', ScreenTimeIcon],
] 

const Content = ({cntHeading, setCntHeading, navSelect, setNavSelect})=>{
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
                <div className={styles.ContentScrollCnt}>
                    {
                        navSelect === 'block-site' ? <BlockSites setCntHeading={setCntHeading}/> :
                        // navSelect === 'pomodoro' ? <Pomodoro setCntHeading={setCntHeading}/> :
                        navSelect === 'focus-mode' ? <FocusMode /> :
                        navSelect === 'screen-time' ? <ScreenTime setCntHeading={setCntHeading}/> : 
                        <div>Loading...</div>
                    }
                </div>
            </div>
            <nav className={styles.Nav}>
                {navOptElements}
            </nav>
        </div>
    )
}

export default Content