import { useEffect, useRef, useState } from 'react'
import './PopupScreens.scss'
import {RiTimerFill} from "react-icons/ri";


export const PopupFull = ({setClosePopup, children})=>{
    return (
        <div className='popup-screen full' 
            onClick={()=>setClosePopup(true)}
        >
            {children}
        </div>
    )
}

export const PopupToast = ({toastMsg, setToastMsg, toastColorCode, setToastData})=>{

    toastColorCode = toastColorCode ?? null

    return (
        <div className={`prevent-select popup-screen toast ${toastColorCode}`}
            onAnimationEnd={()=>{
                setToastData([null, null])
            }}
        >
            {toastMsg}
        </div> 
    )
}


