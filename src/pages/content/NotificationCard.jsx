import notificationCardStyle from './NotificationCard.scss?inline'; 
import {IoMdClose} from "react-icons/io"

import extensionIcon from '../../assets/logo_3.png'
import { useEffect, useRef, useState } from 'react';
import { updateLocalSettingsData } from '../../localStorage/localSettingsData';

const COUNT_TILL = 10
let cardCount = 0

function NotificationCard({
    createNotificationData
}){
    const [notificationData, setNotificationData] = useState(null)
    const [counter, setCounter] = useState(0)
    const isHoveringRef = useRef(false)

    useEffect(()=>{

        if (notificationData === null){
            return (()=>{

            })
        }

        const intervalIdRef = setInterval(()=>{
            if (isHoveringRef.current === true) {
                return null;
            }

            setCounter( c => {
                if ( c > COUNT_TILL ){
                    clearInterval(intervalIdRef)
                    setNotificationData(null)
                    return 0
                }
                return c + 1
            })
            
        }, 1*1000)


        return (()=>{
            clearInterval(intervalIdRef)
        })

    }, [notificationData])

    useEffect(()=>{

        function handleMessage(request){
            const {
                takeABreakForRestrictRemainingMinutes
            } = request
            
            
            if (takeABreakForRestrictRemainingMinutes){
                updateNotificationData(takeABreakForRestrictRemainingMinutes)
            }
        }

        chrome.runtime.onMessage.addListener(handleMessage)
        
        return ()=>{
            chrome.runtime.onMessage.removeListener(handleMessage)
        }

    }, [])

    const updateNotificationData = (data)=>{
        isHoveringRef.current = false 
        const tempNotificationData = createNotificationData(data)
        setCounter(0)
        setNotificationData(tempNotificationData)
    }


    const handleMouseEnter = (event) => {
        isHoveringRef.current = true
    }
    const handleMouseLeave = (event) => {
        isHoveringRef.current = false
    }

    const {headingMsg, paraMsg, optionArr, updateBadgeIcon} = notificationData || {}
    
    let progressPercentage = ( counter / COUNT_TILL ) * 100
    progressPercentage = progressPercentage > 100 ? 100 : progressPercentage


    const shouldShowCard = Boolean(notificationData)
    const shouldStartSlideUpAnimation = (counter - COUNT_TILL) > 0

    return (
        shouldShowCard ?
        <> 
            <style >
                {notificationCardStyle}
            </style>
            <div 
                className={`outter-cnt ${ shouldStartSlideUpAnimation ? 'slide-up-animation' : '' }`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div 
                    className='cnt'
                > 
                    <Header 
                        handleCloseBtnClick={()=>{
                            setCounter(0)
                            setNotificationData(null)
                        }}
                    />
                    <MessageCnt 
                        headingMsg={headingMsg}
                        paraMsg={paraMsg}
                    />
                    <NeverShowNotificationCheckBox 
                    />
                    <OptionBtn 
                        optionArr={optionArr}
                        setShouldShowCard={(n)=>{
                            setCounter(0)
                            setNotificationData(n)
                        }}
                        updateBadgeIcon={updateBadgeIcon}
                    />


                </div> 
                <ProgressBar 
                    progressPercentage={progressPercentage}
                /> 
            </div>
        </> : 
        null
    )
        
    
}

export default NotificationCard

function NeverShowNotificationCheckBox({}){

    const key = 'should-show-notification'

    return (
        <div className='checkbox-cnt'>
            <input className='checkbox' type="checkbox" 
                value={key}
                onClick={async (e)=>{
                    const newIsChecked = e.target.checked 
                    const shouldNotificationShow = !newIsChecked

                    const updateShouldShowNotification = updateLocalSettingsData[key]
                    await updateShouldShowNotification(shouldNotificationShow)
                }}
            />
            <span className='checkbox-desc-cnt'>
                <span className='checkbox-desc'>
                    Never show this again, can be reset under ⚙️settings. 
                </span>
                <span className='checkbox-more'>
                    more
                </span>
            </span>
        </div>
    )
}

function ProgressBar({progressPercentage}){


    return (
        <div 
            className='progress-bar-cnt'
        >
            <div
                className='progress-bar'
                style={{width: `${progressPercentage}%`}}
            >

            </div>
        </div>
    )
}

function OptionBtn({optionArr, setShouldShowCard, updateBadgeIcon}){

    return (
        <div className='option-btn-cnt'>
            {
                optionArr.map((optionObj, index)=>{
                    return (
                        <button
                            key={index}
                            onClick={async ()=>{
                                await optionObj.handleClick()
                                setShouldShowCard(false)
                                updateBadgeIcon()
                            }}

                        >
                            {optionObj.name}
                        </button>
                    )
                })
            }
        </div>
        
    )
}

function MessageCnt({headingMsg, paraMsg}){

    return (
        <section className='message-cnt'>
            <h3>
                {headingMsg}
            </h3>
            <p>
                {paraMsg}
            </p>
        </section>
    )
}

function Header ({handleCloseBtnClick}){

    return (
        <div className={'header'}>
            <div className={'headerCnt'}>
                <img 
                    className={'extentionIconImg'}
                        src={chrome.runtime.getURL(extensionIcon)} alt="extension icon" 
                />
                <h3  
                    className={'title'}
                >
                    Be Focused
                </h3>

            </div>
            <button
                className='close-btn'
                onClick={()=>handleCloseBtnClick()}
            >
                <IoMdClose />
            </button>
        </div>
    )
}