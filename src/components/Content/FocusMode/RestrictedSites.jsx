import './RestrictedSites.scss';
import AddRestrictedSites from './AddRestrictedSites';
// Icons
import { ImCheckboxUnchecked as UncheckedIcon, ImCheckboxChecked as CheckedIcon } from "react-icons/im"
import { TbBarrierBlock } from "react-icons/tb"
import { BiMemoryCard as SaveIcon } from "react-icons/bi"
import { useContext, useEffect, useState } from 'react';
import { getCurrTab, getRecentHostnames } from '../../../utilities/chrome-tools/chromeApiTools';
import { getFavIconUrlFromGoogleApi, getHost, isValidUrl } from '../../../utilities/simpleTools';
import Loader from '../../../utilities/Loader';
import { getRestrictedSites as  getLocalRestrictedSites, handleRestrictUnRestrictSite} from '../../../localStorage/localSiteTagging';
import { getLocalSettingsData } from '../../../localStorage/localSettingsData';
import { LocalFavIconUrlDataContext } from '../../context';




const RestrictedSites = ({setToastData})=>{

    const [restrictedSites, setRestrictedSites] = useState(null)
    const [recentSites, setRecentSites] = useState([])

    const [dataLoadedStatus, setDataLoadedStatus] = useState({
        restrictedSites: false,
        recentSites: false
    })

    const localFavIconUrlData = useContext(LocalFavIconUrlDataContext)
    const getFavIcon = (hostname)=>{
        return localFavIconUrlData[hostname] || getFavIconUrlFromGoogleApi(hostname)
    }

    const getRestrictedSites = async ()=>{
        const tempRestrictedSites = await getLocalRestrictedSites()
        setRestrictedSites(tempRestrictedSites)
        setDataLoadedStatus(prevDataLoadedStatus => ({...prevDataLoadedStatus, restrictedSites: true}))
    }
    
    const getRecentSites = async ()=> {
        const tempRecentSites = await getRecentHostnames()
        setRecentSites(tempRecentSites)

        setDataLoadedStatus(prevDataLoadedStatus => ({...prevDataLoadedStatus, recentSites: true}))
    }

    useEffect(()=>{

        getRestrictedSites()
        getRecentSites()
    }, [])

    const validMoreSitesToRestrict = recentSites.filter((recentSite)=>!restrictedSites.includes(recentSite))
    
    return (
        Object.values(dataLoadedStatus).includes(false) ? 
        <Loader /> :
        <div className="focus-restricted-sites-cnt">
            <div className="sticky">
                <div className='heading'> 
                    <TbBarrierBlock />
                    <h3>Distracted Sites</h3> 
                </div>

            </div>
            <AddCurrSiteToRestrictedSite 
                setToastData={setToastData}
                restrictedSites={restrictedSites}
                getRestrictedSites={getRestrictedSites}
            />
            <AddRestrictedSites 
                setToastData={setToastData}
                getRestrictedSites={getRestrictedSites}
                recentSites={recentSites}
            />
            <h3 className='site-table-heading restricted sticky'>
                Distracted sites
            </h3>
            {   
                restrictedSites.length ?
                <div className="restricted-site-table">
                    {
                        restrictedSites.map((tempHostname, index)=>{
                            return (
                            <div key={tempHostname} className="item flex-center">
                                <RestrictedCheckBox 
                                    key={tempHostname}
                                    tempHostname={tempHostname} 
                                    getRestrictedSites={getRestrictedSites} 
                                    setToastData={setToastData}
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
            <h3 className='site-table-heading more sticky'>
                Recent sites
            </h3>
            {
                recentSites.length > 0 ? 
                <div className="restricted-site-table more">
                    {
                        validMoreSitesToRestrict.map((tempHostname, index)=>{
                            return (
                                <div key={tempHostname} className="item flex-center">
                                    <AddMoreCheckBox 
                                        key={tempHostname}
                                        tempHostname={tempHostname}
                                        getRestrictedSites={getRestrictedSites} 
                                        setToastData={setToastData}
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

        </div>
    )
}

export default RestrictedSites


const AddCurrSiteToRestrictedSite = ({restrictedSites, getRestrictedSites, setToastData})=>{
    const [currSite, setCurrSite] = useState(null)

    const localFavIconUrlData = useContext(LocalFavIconUrlDataContext)
    const getFavIcon = (hostname)=>{
        return localFavIconUrlData[hostname] || getFavIconUrlFromGoogleApi(hostname)
    }

    useEffect(()=>{
        getCurrTab().then(async (currTab)=>{
            if (!currTab){
                return null
            }
            const {url, favIconUrl} = currTab

            if (!url.startsWith('http')){
                setCurrSite(null)
                return null
            }

            const hostname = getHost(url)
            const ignoreSites = await getLocalSettingsData({key: 'ignore-sites'})
            if (ignoreSites.includes(hostname)){
                setCurrSite(null)
                return null
            }
            
            if (restrictedSites.includes(hostname)){
                setCurrSite(null)
                return null
            }

            setCurrSite(hostname)
        })
    }, [restrictedSites])

    if (currSite === null){
        return null
    }

    return (
        <div className='add-curr-site-to-restrited-site'>
            <div className="icon-cnt">
                <img src={getFavIcon(currSite)} alt="icon" />
            </div>
            <div className="site-cnt">
                <div className="site" 
                    title={currSite}
                >
                    {currSite}
                </div>
                <div className="desc"
                    onClick={async ()=>{
                        const isRestricted = await handleRestrictUnRestrictSite({
                            hostname: currSite,
                            shouldRestrictSite: true,
                            setToastData: setToastData
                        })
                        getRestrictedSites(null)
                    }}
                >
                    Add as distracted site
                </div>
            </div>
        </div>
    )
}


const AddMoreCheckBox = ({tempHostname, getRestrictedSites, setToastData})=>{
    const [isChecked, setIsChecked] = useState(false)
    return (
    <div className='checkbox-cnt'>
        <input type="checkbox" 
            checked={isChecked}
            onChange={ ()=>{
                setIsChecked(val=>!val)

                // *Wait for 250ms for UI 
                setTimeout(async ()=>{
                    const {isSiteRestricted} = await handleRestrictUnRestrictSite({
                        hostname: tempHostname, 
                        shouldRestrictSite: true, 
                        setToastData
                    })

                    getRestrictedSites()
                }, 100)
            }}
        />
    </div>
    )
}

// *Check Box component
const RestrictedCheckBox = ({tempHostname, getRestrictedSites, setToastData})=>{
    const [isChecked, setIsChecked] = useState(true)
    return (
    <div className='checkbox-cnt'>
        <input type="checkbox" 
            checked={isChecked} 
            onChange={()=>{
                setIsChecked(prevIsChecked=>!prevIsChecked)
                
                // *Wait for 250ms for UI 
                setTimeout(async ()=>{
                    const {isSiteRestricted} = await handleRestrictUnRestrictSite({
                        hostname: tempHostname,
                        shouldRestrictSite: false,
                        setToastData
                    })
                    getRestrictedSites()
                }, 100)
            }}
        />
    </div>
    )
}
