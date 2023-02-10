import { useEffect, useState } from 'react'
import { BiLoader, BiLoaderAlt } from 'react-icons/bi'
import styles from './Btn2Cnt.module.scss'

const Btn2Cnt = ({btn1Details, btn2Details})=>{
    return (
    <div className={styles.btn2Cnt}>
        <button 
            className={[btn1Details.style, styles.btn].join(' ')}
            onClick={()=>{
                btn1Details.onClick()
            }}
            >
            {btn1Details.desc}
        </button>
        <button 
            className={styles.btn}
            onClick={()=>{
                btn2Details.onClick()
            }}
            >
            {btn2Details.desc}
        </button>
    </div>
    )
}


export default Btn2Cnt