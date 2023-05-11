import './RestrictedSites.scss';
import AddRestrictedSites from './AddRestrictedSites';
// Icons
import { ImCheckboxUnchecked as UncheckedIcon, ImCheckboxChecked as CheckedIcon } from "react-icons/im"
import { TbBarrierBlock } from "react-icons/tb"
import { BiMemoryCard as SaveIcon } from "react-icons/bi"
import { useEffect, useState } from 'react';
import { addOrRemoveRestrictSite, getCurrTab, getRecnetSitesFromNoOfVisitsTracker } from '../../utilities/chromeApiTools';
import { getHost } from '../../utilities/simpleTools';



const RestrictedSites = ({setToastData})=>{

    const [restrictedSites, setRestrictedSites] = useState(null)

    const [recentSites, setRecentSites] = useState([])

    const getRestrictedSites = async ()=>{
        const {restrictedSites: tempRestrictedSites} = await chrome.storage.local.get('restrictedSites')
        setRestrictedSites(tempRestrictedSites)
    }

    useEffect(()=>{
        getRestrictedSites()
        getRecnetSitesFromNoOfVisitsTracker(-2).then(tempRecentSites=>setRecentSites(tempRecentSites))
    }, [])

    const restrictedSiteArr = restrictedSites ? Object.keys(restrictedSites).map(tempHostname=>tempHostname) : []
    const validMoreSitesToRestrict = recentSites.filter((recentSite)=>!restrictedSiteArr.includes(recentSite))
    




    return (
    <div className="focus-restricted-sites-cnt">
        <div className="sticky">
            <div className='heading'> 
                <TbBarrierBlock />
                <h3>Restricted Sites</h3> 
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
            Your restricted sites
        </h3>
        {   
            restrictedSites ?
            <div className="restricted-site-table">
                {
                    restrictedSiteArr.map((tempHostname, index)=>{
                        const tempFavIconUrl = restrictedSites[tempHostname][0]
                        return (
                        <div key={tempHostname} className="item flex-center">
                            <RestrictedCheckBox 
                                key={tempHostname}
                                tempHostname={tempHostname}
                                addOrRemoveRestrictSite={addOrRemoveRestrictSite} 
                                getRestrictedSites={getRestrictedSites} 
                                setToastData={setToastData}
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
        <h3 className='site-table-heading more sticky'>
            More sites to restrict
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
                                    addOrRemoveRestrictSite={addOrRemoveRestrictSite} 
                                    getRestrictedSites={getRestrictedSites} 
                                    setToastData={setToastData}
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

    </div>
    )
}

export default RestrictedSites


const AddCurrSiteToRestrictedSite = ({restrictedSites, getRestrictedSites, setToastData})=>{
    const [currSite, setCurrSite] = useState(null)
    const [favIconURL, setFavIconUrl] = useState(null)
    useEffect(()=>{
        getCurrTab().then(({url, favIconUrl})=>{
            if (url && url.startsWith('http')){
                if (restrictedSites && !restrictedSites[getHost(url)]){
                    setCurrSite(url)
                    setFavIconUrl(favIconUrl)
                }
                else{
                    setCurrSite(null)
                    setFavIconUrl(null)
                }
            }
        })
    }, [restrictedSites])
    return (
        currSite !== null ? 
        <div className='add-curr-site-to-restrited-site'>
            <div className="icon-cnt">
                <img src={`http://www.google.com/s2/favicons?domain=${getHost(currSite)}&sz=${128}`} alt="icon" />
            </div>
            <div className="site-cnt">
                <div className="site" 
                    title={getHost(currSite)}
                >
                    {getHost(currSite)}
                </div>
                <div className="desc"
                    onClick={async ()=>{
                        await addOrRemoveRestrictSite(true, getHost(currSite), favIconURL)
                        getRestrictedSites(null)
                        setToastData(['Added the current site', 'green'])
                    }}
                >
                    Restrict the current site
                </div>
            </div>
        </div>
        : null
    )
}


const AddMoreCheckBox = ({tempHostname, addOrRemoveRestrictSite, getRestrictedSites, setToastData})=>{
    const [isChecked, setIsChecked] = useState(false)
    return (
    <div className='checkbox-cnt'>
        <input type="checkbox" 
            checked={isChecked}
            onChange={ ()=>{
                setIsChecked(val=>!val)

                // *Wait for 500ms for UI 
                setTimeout(async ()=>{
                    await addOrRemoveRestrictSite(true, tempHostname, null)
                    getRestrictedSites()
                    setToastData(['Restricted the site', 'green'])
                }, 500)
            }}
        />
    </div>
    )
}

// *Check Box component
const RestrictedCheckBox = ({tempHostname, addOrRemoveRestrictSite, getRestrictedSites, setToastData})=>{
    const [isChecked, setIsChecked] = useState(true)
    return (
    <div className='checkbox-cnt'>
        <input type="checkbox" 
            checked={isChecked} 
            onChange={()=>{
                setIsChecked(prevIsChecked=>!prevIsChecked)
                
                // *Wait for 500ms for UI 
                setTimeout(async ()=>{
                    await addOrRemoveRestrictSite(false, tempHostname, null)
                    getRestrictedSites()
                    setToastData(['Removed the site', 'red'])
                }, 500)
            }}
        />
    </div>
    )
}
