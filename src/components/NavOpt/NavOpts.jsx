import { 
    Link,
} from "react-router-dom"

import styles from "./NavOpt.module.scss"


const NavOpts = ({navSelect, setNavSelect, details})=>{
    const [navOpt, desc, Icon] = details
    
    return (
            <div 
                className={[
                    styles.NavOptCnt, 
                    styles[navOpt],
                    navOpt===navSelect ? styles.active:null
                ].join(' ')}
                onClick={()=>{
                    setNavSelect(navOpt)
                }}
                >
                <Icon />
                <span className={styles.desc}>
                    {desc}
                </span>
            </div>
    ) 
} 
export default NavOpts