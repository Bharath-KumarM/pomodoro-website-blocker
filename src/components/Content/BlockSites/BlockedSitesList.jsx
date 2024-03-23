import { FiPlus } from "react-icons/fi"

import { useEffect, useState, useRef, useContext } from "react"

import { getFavIconUrlFromGoogleApi, getHost, isValidUrl } from "../../../utilities/simpleTools"
import { getCurrTab, getRecentHostnames } from "../../../utilities/chrome-tools/chromeApiTools"
import AddSiteToBlockedSite from "./AddSiteToBlockedSite"

import { getBlockedSites, handleBlockUnblockSite } from "../../../localStorage/localSiteTagging"
import { getLocalSettingsData } from "../../../localStorage/localSettingsData"
import { LocalFavIconUrlDataContext } from "../../context"

const BlockedSitesList = ({setToastData}) => {

    const [blockedSites, setBlockedSites] = useState({})
    const [recentSites, setRecentSites] = useState([])

    const localFavIconUrlData = useContext(LocalFavIconUrlDataContext)

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

    const getFavIcon = (hostname)=>{
        return localFavIconUrlData[hostname] || getFavIconUrlFromGoogleApi(hostname)
    }

    const validMoreSitesToBlock = recentSites.filter((recentSite)=>!blockedSites.includes(recentSite))


    return (
    <>
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
                                <img src={getFavIcon(tempHostname)} alt="icon" />
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
                                    <img src={getFavIcon(tempHostname)} alt="icon" />
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

const AddCurrSiteToBlockedSite = ({blockedSites,getUpdatedBlockedSites, setToastData})=>{
    const [currSiteDetails, setCurrSiteDetails] = useState([null, null])
    const localFavIconUrlData = useContext(LocalFavIconUrlDataContext)


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

    const getFavIcon = (hostname)=>{
        return localFavIconUrlData[hostname] || getFavIconUrlFromGoogleApi(hostname)
    }

    const [currSiteHostname, currSiteFavIconUrl] = currSiteDetails
    
    return (
        currSiteHostname ? 
        <div className='add-curr-site-to-blocked-site'>
            <div className="icon-cnt">
                {
                    currSiteFavIconUrl ? 
                    <img src={currSiteFavIconUrl} alt="icon" />
                    : <img src={getFavIcon(currSiteHostname)} alt={currSiteHostname} />
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
                    Block the site
                </div>
            </div>
        </div>
        : null
    )
}