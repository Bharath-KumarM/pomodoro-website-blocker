import { useEffect, useRef, useState } from 'react'
import './PopupScreens.scss'


export const PopupFull = ({content, setClosePopup})=>{
    return (
        <div className='popup-screen full' 
            onClick={()=>setClosePopup(true)}
        >
            {content}
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

