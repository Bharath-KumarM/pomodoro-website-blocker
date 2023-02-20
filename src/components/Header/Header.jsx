import style from './Header.module.scss'

// import { FiSettings } from 'react-icons/fi'  
import { IconContext } from "react-icons";
import {AiTwotoneHome} from 'react-icons/ai'  
import { MdSettingsSuggest } from 'react-icons/md' 
import { GiConfirmed } from 'react-icons/gi'


const Header = (props)=>{
    const [setCntHeading, setNavSelect] = [props.setCntHeading, props.setNavSelect]

    return (
    <IconContext.Provider value={{className: style.icon}}>
        <div className={style.header}>
            <div className={style.headerCnt}>
                <button 
                    className={style.iconBtn}
                    onClick={()=>{
                        setNavSelect('home')
                        setCntHeading('Home')
                        }}
                    >
                    <AiTwotoneHome />
                </button>
                <h3 className={style.title}>Screen Time | Site Blocker | Pomodoro</h3>
                <div 
                    className={style.titleIcon}
                    title={'Screen Time | Site Blocker | Pomodoro'}
                    >
                        <img src="../../../png/logo_1.png" alt="icon" />
                    {/* <GiConfirmed /> */}
                </div>
                <button 
                    className={style.iconBtn}
                    onClick={()=>{
                        setNavSelect('settings')
                        setCntHeading('Settings')
                    }}
                    >
                    <MdSettingsSuggest />
                </button>
            </div>
        </div>
    </IconContext.Provider>
    )
}

export default Header