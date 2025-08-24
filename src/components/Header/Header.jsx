import { createHelpScreenTab, createPopupScreenTab } from '../../utilities/chrome-tools/forceTabs';
import style from './Header.module.scss'
import extensionIcon from '../../assets/logo_3.png'

import {MdSettings as SettingsIcon} from "react-icons/md"
import { IoHelp } from "react-icons/io5";
import { RxOpenInNewWindow } from "react-icons/rx";
import useWindowSize from '../../utilities/hooks/useWindowSize';



const Header = ({setNavSelect})=>{
    const {width, height} = useWindowSize();

    const isSamllWindow = (width < 650)

    return (
        <div className={style.header}>
            <div className={style.headerOuterCnt}>
                <div className={style.leftIconCnt}
                    onClick={()=> setNavSelect('setting')}
                    title='Settings'
                >
                    <SettingsIcon />
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

                {
                    isSamllWindow ? 
                        <div className={style.rightIconCnt}
                            onClick={()=> createPopupScreenTab()}
                            title='Open as tab'
                        >
                            <RxOpenInNewWindow />
                        </div>
                    :   
                        <div className={style.rightIconCnt}
                            onClick={()=> createHelpScreenTab()}
                            title='Open help screen'
                        >
                            <IoHelp />
                        </div>
                }

            </div>
        </div>
    )
}

export default Header