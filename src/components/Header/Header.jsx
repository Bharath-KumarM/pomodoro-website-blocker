import { createWelcomeScreencreenTab } from '../../utilities/chrome-tools/forceTabs';
import style from './Header.module.scss'

// import { FiSettings } from 'react-icons/fi'  
import { IconContext } from "react-icons";



const Header = (props)=>{

    return (
    <IconContext.Provider value={{className: style.icon}}>
        <div className={style.header}>
            <div className={style.headerCnt}
                //! Debug starts
                onClick={()=>{
                    // Debugging welcome screen
                    createWelcomeScreencreenTab()
                }}
                //! Debug ends
            >
                <h3 className={style.title}>Be Focused</h3>
            </div>
        </div>
    </IconContext.Provider>
    )
}

export default Header