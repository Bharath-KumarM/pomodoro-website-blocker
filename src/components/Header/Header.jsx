import { createHelpScreencreenTab, createWelcomeScreencreenTab } from '../../utilities/chrome-tools/forceTabs';
import style from './Header.module.scss'
import extensionIcon from '../../../logo_3.png'


const Header = (props)=>{

    return (
        <div className={style.header}>
            <div className={style.headerCnt}>
                <img 
                    className={style.extentionIconImg}
                    src={extensionIcon} alt="extension icon" 
                />
                <h3  
                    className={style.title}
                    onClick={()=>{
                        // createWelcomeScreencreenTab()
                        createHelpScreencreenTab()
                    }}
                >
                    Be Focused
                </h3>

            </div>
        </div>
    )
}

export default Header