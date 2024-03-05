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



const navOptionData = [ 
    ['dashboard', 'Dashboard', DashboardIcon],
    ['block-site', 'Block Site', BlockIcon],
    ['focus-mode', 'Focus Mode', FocusModeIcon],
    ['screen-time', 'Screen Time', ScreenTimeIcon],
] 

const Content = ({navSelect, setNavSelect})=>{
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
                        navSelect === 'dashboard' ? <Dashboard /> :
                        // navSelect === 'pomodoro' ? <Pomodoro /> :
                        navSelect === 'focus-mode' ? <FocusMode setNavSelect={setNavSelect}  /> :
                        navSelect === 'screen-time' ? <ScreenTime setNavSelect={setNavSelect}  /> : 
                        navSelect === 'setting' ? <Setting setNavSelect={setNavSelect} /> :
                        navSelect === 'block-site' ? <BlockSites setNavSelect={setNavSelect} /> : 

                        <Loader />
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