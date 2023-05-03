import style from './Header.module.scss'

// import { FiSettings } from 'react-icons/fi'  
import { IconContext } from "react-icons";



const Header = (props)=>{
    const [setCntHeading, setNavSelect] = [props.setCntHeading, props.setNavSelect]

    return (
    <IconContext.Provider value={{className: style.icon}}>
        <div className={style.header}>
            <div className={style.headerCnt}>
                {/* <h3 className={style.title}>Screen Time | Site Blocker | Pomodoro</h3> */}
                <h3 className={style.title}>Be Focused</h3>
                {/* <div 
                    className={style.titleIcon}
                    title={'Screen Time | Site Blocker | Pomodoro'}
                    >
                        <img src="../../../png/logo_1.png" alt="icon" />
                </div> */}
            </div>
        </div>
    </IconContext.Provider>
    )
}

export default Header