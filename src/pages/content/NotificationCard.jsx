import notificationCardStyle from './NotificationCard.scss?inline'; 
import {IoMdClose} from "react-icons/io"

import extensionIcon from './logo_3.png'
import { useEffect, useRef, useState } from 'react';



function NotificationCard({
    getNotificationData
}){
    const [notificationData, setNotificationData] = useState(null)
    const [counter, setCounter] = useState(0)
    const outterCntRef = useRef(null)
    const isHoveringRef = useRef(false)
    const intervalIdRef = useRef(null)


    useEffect(()=>{
        const COUNT_TILL = 10



        function handleMessage(request, sender, sendResponse){
            const {
                takeABreakForRestrictRemainingMinutes
            } = request

    
            if (takeABreakForRestrictRemainingMinutes){
                setNotificationData(getNotificationData(takeABreakForRestrictRemainingMinutes))

                isHoveringRef.current = false 
                clearInterval(intervalIdRef.current)

                intervalIdRef.current = setInterval(()=>{

                    if (!isHoveringRef.current) {
                        setCounter( c => {
                            let nextCount = c + 1
                            if ( nextCount >= COUNT_TILL ){
                                clearInterval(intervalIdRef.current)
                                setNotificationData(null)
                                return 0
                            }
                            return nextCount
                        })
                    }
                }, 1*1000)

            }
        }

        chrome.runtime.onMessage.addListener(handleMessage)
        
        

        return ()=>{
            chrome.runtime.onMessage.removeListener(handleMessage)
            clearInterval(intervalIdRef.current)
        }
    }, [])

    const handleMouseEnter = (event) => {
        isHoveringRef.current = true
    }
    const handleMouseLeave = (event) => {
        isHoveringRef.current = false
    }

    const {headingMsg, paraMsg, optionArr, updateBadgeIcon} = notificationData || {}
    
    const COUNT_TILL = 10
    const progressPercentage = ( counter / COUNT_TILL ) * 100

    const shouldShowCard = Boolean(notificationData) && progressPercentage <= 100

    return (
        <div ref={outterCntRef}>
            <style >
                {notificationCardStyle}
            </style>
            {
                shouldShowCard ? 
                <div 
                    className={`outter-cnt`}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div 
                        className='cnt'
                    > 
                        <Header 
                            setShouldShowCard={(n)=>{
                                setCounter(0)
                                setNotificationData(n)
                            }}
                        />
                        <MessageCnt 
                            headingMsg={headingMsg}
                            paraMsg={paraMsg}
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
                : null
            }
        </div>
    )
}

export default NotificationCard


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

function Header ({setShouldShowCard}){

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
                onClick={()=>setShouldShowCard(false)}
            >
                <IoMdClose />
            </button>
        </div>
    )
}