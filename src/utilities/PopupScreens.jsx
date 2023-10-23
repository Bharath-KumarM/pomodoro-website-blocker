import { useEffect, useRef, useState } from 'react'
import './PopupScreens.scss'
import {RiTimerFill} from "react-icons/ri";


export const PopupFull = ({setClosePopup, children})=>{
    return (
        <div className='popup-screen full' 
            onClick={(e)=>{
                e.stopPropagation()
                setClosePopup(true)
            }}
        >
            {children}
        </div>
    )
}

export const PopupToast = ({toastData, setToastData})=>{

    const popupToastRef = useRef(null);

    useEffect(()=>{
        popupToastRef.current.style.animation = 'none';
        popupToastRef.current.offsetHeight; /* trigger reflow */
        popupToastRef.current.style.animation = null; 
        
    }, [toastData])

    let [toastMsg, toastColorCode] = toastData
    toastColorCode = toastColorCode ?? null;

    return (
        <div className={`prevent-select popup-screen toast ${toastColorCode}`}
            ref={popupToastRef}
            onAnimationEnd={()=>{
                setToastData([null, null])
            }}
        >
            {toastMsg}
        </div> 
    )
}


