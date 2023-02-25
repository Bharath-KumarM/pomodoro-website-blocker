import styles from "./Content.module.scss"

import { useState } from "react"

// Icons
import {ImBlocked as BlockIcon} from "react-icons/im"
import {GiTomato as PomodoroIcon} from "react-icons/gi"
import {MdTimer as ScreenTimeIcon} from "react-icons/md"

// Components 
import NavOpts from "../NavOpt/NavOpts"
import Pomodoro from "../Pomodoro/Pomodoro"
import ScreenTime from "../ScreenTime/ScreenTime"
import BlockSites from "../BlockSites/BlockSites"



const navOptionData = [
    ['block-site', 'Block Site', BlockIcon],
    // ['pomodoro', 'Pomodoro', PomodoroIcon],
    ['screen-time', 'Screen Time', ScreenTimeIcon]
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

    const contentEle =  navSelect === 'block-site' ? <BlockSites setCntHeading={setCntHeading}/> :
                        // navSelect === 'pomodoro' ? <Pomodoro setCntHeading={setCntHeading}/> :
                        navSelect === 'screen-time' ? <ScreenTime setCntHeading={setCntHeading}/> : 
                        navSelect === 'home' ? <div>Home</div> : 
                        navSelect === 'settings' ? <div>Settings</div> : 
                        <div>Loading...</div>
    
    return (
        <div className={styles.Cnt}>
            <nav className={styles.Nav}>
                {navOptElements}
            </nav>
            <div className={styles.ContentCnt}>
                {/* <h2 className={styles.Heading}>{cntHeading}</h2> */}
                {contentEle}
            </div>
        </div>
    )
}

export default Content