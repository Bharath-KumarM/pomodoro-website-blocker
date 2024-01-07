import { createHelpScreenTab } from '../../utilities/chrome-tools/forceTabs';
import style from './Header.module.scss'
import extensionIcon from '../../../logo_3.png'

import {MdSettings as SettingsIcon, MdHelp as HelpIcon} from "react-icons/md"


const Header = ({setNavSelect})=>{

    return (
        <div className={style.header}>
            <div className={style.headerOuterCnt}>
                <div className={style.helpIconCnt}
                    onClick={()=> createHelpScreenTab()}
                    title='Help'
                >
                    <HelpIcon />
                </div>
                <div className={style.headerCnt}>
                    <img 
                        className={style.extentionIconImg}
                        src={extensionIcon} alt="extension icon" 
                    />
                    <h3  
                        className={style.title}
                        onClick={()=>{
                            createHelpScreenTab()
                        }}
                    >
                        Be Focused
                    </h3>

                </div>
                <div className={style.settingIconCnt}
                    onClick={()=> setNavSelect('setting')}
                    title='Settings'
                >
                    <SettingsIcon />
                </div>
            </div>
        </div>
    )
}

export default Header