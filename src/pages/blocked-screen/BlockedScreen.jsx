import { useEffect, useState } from 'react';
import './BlockedScreen.scss';


const countDownMsg = [
    'Take a deep breath❄️',
    'Take a deep breath❄️',
    'Relax...🧊',
    'Relax...🧊',
    'Think why you blocked this site now!🤔',
    'Think why you blocked this site now!🤔',
    'Think why you blocked this site now!🤔',
    'Still you want to unblock this site',
    'Still you want to unblock this site',
    'Still you want to unblock this site',
    'Okay...',
    'Okay...',
    'Go Head...',
    'Go Head...'
]
const BlockedScreen = ()=>{
    const [blockedSiteData, setBlockedSiteData] = useState(null)
    const [count, setCount] = useState(30)

    const [hostname, favIcon] = blockedSiteData ? blockedSiteData : [null, null]
    
    const handleCompountMounted = async () =>{

        const {blockedScreenData} = await chrome.storage.local.get('blockedScreenData')
        console.log(blockedScreenData)

        const queryOptions = { currentWindow: true, active: true }
        const [tab] = await chrome.tabs.query(queryOptions)
        const {id: tabId} = tab
        console.log(tabId)
        if (!blockedScreenData[tabId]) {
            console.log('no blockedScreeendata from BG')
            return
        }
        const [tempHostname, tempFavIcon] = blockedScreenData[tabId]

        const {blockedSites} = await chrome.storage.local.get('blockedSites')
        if (!blockedSites[tempHostname]){
            // Got unblocked - refresh with a blocked url
            chrome.tabs.update(tabId, {url: `http://${tempHostname}`}); 
            return
        }

        setBlockedSiteData([tempHostname, tempFavIcon])
    }
    
    useEffect(()=>{
        handleCompountMounted()
    }, [])

    useEffect(()=>{
        if (count >= 0){
            setTimeout(()=>{
                setCount((prevCount)=>prevCount-1)
            }, 1000)
        }
    }, [count])

    const handleUnblockBtnClick = ()=>{
        chrome.runtime.
            sendMessage({
                blockSitesData: {
                    hostName: hostname,
                    favIconUrl: favIcon
                }, 
                msg: 'unBlockSite',
            })
    }
    return (
    <div className='blocked-scrn-cnt'>
        <div className="heading">
            <h2>
                This site has been blocked!
            </h2>
            <h4>
                Website Blocker - Extension
            </h4>
        </div>
        <div className="block-site-card">
            <div className='icon-cnt'>
                {favIcon ? <img src={favIcon} alt="icon" /> : null}
            </div>
            <div className='desc-cnt'>
                <h3>
                    {hostname ? hostname : null}
                </h3>
            </div>
            {
                hostname ? 
                <div className='btn-cnt'>
                    {
                        count <= 0 ? 
                        <button 
                            className='btn'
                            onClick={()=>handleUnblockBtnClick()}
                        >
                            Unblock this site
                        </button> :
                        countDownMsg[30-count] ? 
                        <h1>
                            {countDownMsg[30-count]}
                        </h1> : 
                        <h2>
                            {`Wait for ${count} sec to unblock...`}
                        </h2>
                    }
                </div> :
                <h1>
                    Loading...
                </h1>
            }
        </div>
    </div>
    )
}

export default BlockedScreen

const BlockBtn = ()=>{
    const [leftTime, setLeftTime] = useState(60)
    const [isBtnActive, setIsBtnAtive] = useState(false)
    useEffect(()=>{
        if (leftTime > 1){
            setTimeout(()=>{
                setLeftTime(prevLeftTime => prevLeftTime-1)
            }, 1000)
        }
        else {
            setIsBtnAtive(true)
        }
    }, [leftTime, isBtnActive])
    return (
        <button 
            className="btn"
            onClick={async ()=>{
                if (isBtnActive){
                    const {blockedSites} = await chrome.storage.local.get('blockedSites')

                }
            }}
        >
            {isBtnActive ? `Cooling Time (${leftTime}sec)` : 'Unblock Site'} 
        </button>
    )
}

