import { createHelpScreenTab } from '../../utilities/chrome-tools/forceTabs';
import style from './Header.module.scss'
import extensionIcon from '../../assets/logo_3.png'

import {MdSettings as SettingsIcon} from "react-icons/md"
import { IoHelp } from "react-icons/io5";


const Header = ({setNavSelect})=>{

    return (
        <div className={style.header}>
            <div className={style.headerOuterCnt}>
                <div className={style.helpIconCnt}
                    onClick={()=> createHelpScreenTab()}
                    title='Help'
                >
                    <IoHelp />
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