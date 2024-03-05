import React from 'react'
import styles from './NavBar.module.scss'

const NavBar = ({setNavSelect, navDetailsArr}) => {
    return (
        <div className={styles.NavBarCnt}>
            <div className={styles.NavBar}>
                <span 
                    className={styles.Nav}
                    onClick={()=>setNavSelect('dashboard')}
                >
                    Dashboard
                </span>
                {
                    navDetailsArr.map(([navPathName, navPathSelect])=>{

                        return (
                            <React.Fragment key={navPathName}>
                                <span>{'>'}</span>
                                <span 
                                    className={styles.Nav}
                                    onClick={()=>setNavSelect(navPathSelect)}
                                >
                                    {navPathName}
                                </span>
                            </React.Fragment>
                        )
                    })
                }
            </div>
            <hr className={styles.Line}>

            </hr>
        </div>
    )
}

export default NavBar