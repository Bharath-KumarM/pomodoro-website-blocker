import { useEffect, useState } from 'react'
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

export const PopupToast = ({toastMsg})=>{
    const [message, setMessage] = useState(toastMsg ? toastMsg[0] : null)
    let timeoutId

    useEffect(()=>{
        clearTimeout(timeoutId)

        if (message){
            timeoutId = setTimeout(()=>{
                setMessage(null)
            }, 1900)
        }
    }, [message])

    useEffect(()=>{
        setMessage(toastMsg)
    }, [toastMsg])

    return (
        <>
        {
            message === null ?
            null:
            <div className='prevent-select popup-screen toast ' 
            >
                {message}
            </div> 
        }
        </>
    )
}

