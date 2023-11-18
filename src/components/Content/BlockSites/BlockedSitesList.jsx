import {ImBlocked} from "react-icons/im"
import { FiPlus } from "react-icons/fi"

import { useEffect, useState, useRef } from "react"

import { getHost, isValidUrl } from "../../../utilities/simpleTools"
import { getCurrTab, getRecentHostnames } from "../../../utilities/chrome-tools/chromeApiTools"
import AddSiteToBlockedSite from "./AddSiteToBlockedSite"

import { getBlockedSites, handleBlockUnblockSite } from "../../../localStorage/localSiteTagging"
import { getLocalSettingsData } from "../../../localStorage/localSettingsData"

const BlockedSitesList = ({setToastData}) => {

    const [blockedSites, setBlockedSites] = useState({})
    const [recentSites, setRecentSites] = useState([])

    const getUpdatedBlockedSites = async () =>{ 
        setBlockedSites(await getBlockedSites())
        return true;
    }

    useEffect(()=>{
        // *For scroll up animation
        const element = document.getElementById('block-site-list-id');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }

        getUpdatedBlockedSites()
        getRecentHostnames().then(tempRecentSites=>setRecentSites(tempRecentSites))
    }, [])

    const validMoreSitesToBlock = recentSites.filter((recentSite)=>!blockedSites.includes(recentSite))


    return (
    <>
        {/* Inside the container */}
        <hr className="hr-line"></hr>
        <div className="sticky-ele">
            <div className="heading">
                <ImBlocked />
                <h3> Block Sites </h3>
            </div>
        </div>
        <AddCurrSiteToBlockedSite 
            setToastData={setToastData}
            blockedSites={blockedSites}
            getUpdatedBlockedSites={getUpdatedBlockedSites}
        />
        <AddSiteToBlockedSite
            setToastData={setToastData}
            getUpdatedBlockedSites={getUpdatedBlockedSites}
            recentSites={recentSites}
        />

        <h3 className='site-table-heading restricted sticky-ele'>
            List of blocked site
        </h3>
        {   
            blockedSites.length ?
            <div className="restricted-site-table">
                {
                    blockedSites.map((tempHostname, index)=>{
                        // todo: need to setup favIcon collector storage
                        const tempFavIconUrl = null
                        return (
                        <div key={tempHostname} className="item flex-center">
                            <CheckBox 
                                key={tempHostname}
                                hostname={tempHostname}
                                getUpdatedBlockedSites={getUpdatedBlockedSites} 
                                setToastData={setToastData}
                                favIconUrl={tempFavIconUrl}
                                isBlocked={true}
                            />
                            <div className='site-icon'>
                                <img src={tempFavIconUrl ? tempFavIconUrl : `http://www.google.com/s2/favicons?domain=${tempHostname}&sz=${128}`} alt="icon" />
                            </div>
                            <div className="site"> {tempHostname} </div>
                        </div>
                        )
                    })
                }
            </div> 
            :
            <div className="no-restricted-sites-cnt flex-center">
                No Sites
            </div>
        }
        <h3 className='site-table-heading more sticky-ele'>
            Recent sites to block
        </h3>

        {
            recentSites.length > 0 ? 
            <div className="restricted-site-table more">
                {
                    validMoreSitesToBlock.map((tempHostname, index)=>{
                        return (
                            <div key={tempHostname} className="item flex-center">
                                <CheckBox 
                                    key={tempHostname}
                                    hostname={tempHostname}
                                    getUpdatedBlockedSites={getUpdatedBlockedSites} 
                                    setToastData={setToastData}
                                    favIconUrl={null}
                                    isBlocked={false}
                                />
                                <div className='site-icon'>
                                    <img src={`http://www.google.com/s2/favicons?domain=${tempHostname}&sz=${128}`} alt="icon" />
                                </div>
                                <div className="site"> {tempHostname} </div>
                            </div>
                        )
                    })
                }

            </div> :
            <div className="no-restricted-sites-cnt flex-center">
                No Sites
            </div>
        }
    </>
    )

}

const CheckBox = ({hostname, getUpdatedBlockedSites, setToastData, isBlocked, favIconUrl})=>{
    const [isChecked, setIsChecked] = useState(isBlocked)
    return (
        <div className='checkbox-cnt'>
            <input type="checkbox" 
                checked={isChecked}
                onChange={ async ()=>{
                    setIsChecked(val=>!val)
                    
                    const shouldBlockSite = !isBlocked
                    await handleBlockUnblockSite({hostname, shouldBlockSite, setToastData})
                    
                    getUpdatedBlockedSites()

                }}
            />
        </div>
    )
}

export default BlockedSitesList

const AddSiteToBlockedSite2 = ({getUpdatedBlockedSites, setToastData})=>{
    const [userInput, setUserInput] = useState('')
    const inputRef = useRef(null)

    let isUserInputValidUrl = isValidUrl(userInput)

    const handleAddBtnClick = async ()=>{
        const hostname = getHost(userInput)
        const shouldBlockSite = true

        const isSiteBLocked = await handleBlockUnblockSite({
            hostname, setToastData, shouldBlockSite
        })


        inputRef.current.value = ''
        setUserInput('')
        getUpdatedBlockedSites()
    }

    const sampleSites = ['www.google.com', 'music.youtube.com', 'fireship.io'] //todo: take backup site and update this
    return (
        <div className='add-blocked-site-cnt'>
            <div key={0} className="item active">
                <div title='add site'
                    className={`cell plus-btn-cnt flex-center ${isUserInputValidUrl ? 'active' : ''}`} 
                    onClick={()=>handleAddBtnClick()}
                >
                    <div className={`inner-cnt flex-center `}>
                        <FiPlus />
                    </div>
                </div>
                <div className='cell site-icon flex-center'>
                    {
                        isUserInputValidUrl ?
                        <img src={`http://www.google.com/s2/favicons?domain=${getHost(userInput)}&sz=${128}`} alt="icon" />
                        : null
                    }
                </div>
                <div className="cell site-input-cnt flex-center">
                    <input 
                        type="text" 
                        className="site-input" 
                        onChange={(e)=>{
                            setUserInput(e.target.value)
                        }}
                        onKeyDown={(e)=>{
                            if (e.key === 'Enter'){
                                handleAddBtnClick()
                            }
                        }}
                        placeholder={"Add sites"}
                        list="site-list"
                        ref={inputRef}
                    />
                    <datalist id="site-list">
                        {
                            sampleSites.map((site, key)=>{
                                <option key={key} value={site} />
                            })
                        }
                    </datalist>
                </div>
            </div>
        </div>
    )
}




const AddCurrSiteToBlockedSite = ({blockedSites,getUpdatedBlockedSites, setToastData})=>{
    const [currSiteDetails, setCurrSiteDetails] = useState([null, null])

    useEffect(()=>{
        getCurrTab().then(async ({url,favIconUrl})=>{
            if (url.startsWith('http')){
                const hostname = getHost(url)

                if (blockedSites.includes(hostname)) {
                    setCurrSiteDetails([null, null])
                    return null
                }

                const ignoreSites = await getLocalSettingsData({key: 'ignore-sites'})
                if (ignoreSites.includes(hostname)){
                    setCurrSiteDetails([null, null])
                    return null
                }

                setCurrSiteDetails([hostname, favIconUrl])
            }
        })
    }, [blockedSites])

    const [currSiteHostname, currSiteFavIconUrl] = currSiteDetails
    
    return (
        currSiteHostname ? 
        <div className='add-curr-site-to-blocked-site'>
            <div className="icon-cnt">
                {
                    currSiteFavIconUrl ? 
                    <img src={currSiteFavIconUrl} alt="icon" />
                    : <img src={`http://www.google.com/s2/favicons?domain=${currSiteHostname}&sz=${128}`} alt="icon" />
                }
            </div>
            <div className="site-cnt">
                <div className="site">
                    {currSiteHostname}
                </div>
                <div className="desc"
                    onClick={async ()=>{
                        const isSiteBlocked = await handleBlockUnblockSite({
                            hostname: currSiteHostname, 
                            shouldBlockSite: true,
                            setToastData
                        })

                        getUpdatedBlockedSites()
                    }}
                >
                    Block the current site
                </div>
            </div>
        </div>
        : null
    )
}