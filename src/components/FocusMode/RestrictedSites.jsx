import './RestrictedSites.scss';
import AddRestrictedSites from './AddRestrictedSites';
// Icons
import { ImCheckboxUnchecked as UncheckedIcon, ImCheckboxChecked as CheckedIcon } from "react-icons/im"
import { TbBarrierBlock } from "react-icons/tb"
import { BiMemoryCard as SaveIcon } from "react-icons/bi"
import { useEffect, useState } from 'react';
import { addOrRemoveRestrictSite, getCurrTab } from '../../utilities/chromeApiTools';
import { getHost } from '../../utilities/simpleTools';



const RestrictedSites = ({setToastMsg})=>{

    const [restrictedSites, setRestrictedSites] = useState(null)
    const [isSelectedArr, setIsSelectedArr] = useState([])
    const [isUnsaved, setIsUnsaved] = useState(false)

    useEffect(()=>{
        if (restrictedSites === null){
            chrome.storage.local.get('restrictedSites').then(({restrictedSites: tempRestrictedSites})=>{
                if(!tempRestrictedSites) {
                    chrome.storage.local.set({'restrictedSites': {}}) 
                    setRestrictedSites({})
                    return null;
                }
                setRestrictedSites(tempRestrictedSites)
                setIsSelectedArr(Object.keys(tempRestrictedSites).map(()=>true))
            })
        }
    }, [restrictedSites])

    const handleSaveClicked = ()=>{
        if (!restrictedSites) return

        const tempRestrictedSites = {}
        Object.keys(restrictedSites).map((tempHost, index)=>{
            if (isSelectedArr[index]){
                const tempFavIconUrl = restrictedSites[tempHost]
                tempRestrictedSites[tempHost] = tempFavIconUrl
            }
        })
        chrome.storage.local.set({'restrictedSites': tempRestrictedSites}, ()=>{
            setToastMsg('Saved')
            setIsUnsaved(false)
        })

    }
    return (
    <div className="focus-restricted-sites-cnt">
        <div className="sticky">
            <div className='heading'> 
                <TbBarrierBlock />
                {/* Previous, it was focused blocked sites */}
                <h3>Restricted Sites</h3> 
            </div>
            <div className="btn-cnt">
                <button 
                    onClick={()=> {
                        setIsSelectedArr(prevIsSelectedArr=>prevIsSelectedArr.map(val=>true))
                        setIsUnsaved(true)
                    }}
                >   
                    <CheckedIcon />
                    <div>
                        Select all
                    </div>
                </button>
                <button
                    onClick={()=>{
                        setIsSelectedArr(prevIsSelectedArr=>prevIsSelectedArr.map(val=>false))
                        setIsUnsaved(true)
                    }}
                >
                    <UncheckedIcon />
                    <div>
                        Unselect all
                    </div>
                </button>
                <button 
                    onClick={()=>handleSaveClicked()}
                    className={isUnsaved ? 'un-saved' : 'saved'}
                >
                    <SaveIcon />
                    <div>
                        {isUnsaved ? 'Not Saved' : 'Saved'}
                    </div>
                </button>
            </div>
        </div>
        <AddCurrSiteToRestrictedSite 
            setToastMsg={setToastMsg}
            restrictedSites={restrictedSites}
            setRestrictedSites={setRestrictedSites}
        />
        <AddRestrictedSites 
            setToastMsg={setToastMsg}
            setRestrictedSites={setRestrictedSites}
        />
        {   
            restrictedSites ?
            <div className="restricted-site-table">
                {Object.keys(restrictedSites).map((tempHostname, index)=>{
                    const tempFavIconUrl = restrictedSites[tempHostname][0]
                    return (
                    <div key={index} className="item flex-center">
                        <div className='checkbox-cnt'>
                            <input type="checkbox" checked={isSelectedArr[index]}
                                onChange={()=>{
                                    setIsSelectedArr(prevIsSelectedArr=>{
                                        prevIsSelectedArr[index] = !prevIsSelectedArr[index]
                                        return [...prevIsSelectedArr]
                                    })
                                    setIsUnsaved(true)
                                }}
                            />
                        </div>
                        <div className='site-icon'>
                            <img src={tempFavIconUrl ? tempFavIconUrl : `http://www.google.com/s2/favicons?domain=${tempHostname}&sz=${128}`} alt="icon" />
                        </div>
                        <div className="site"> {tempHostname} </div>
                    </div>
                    )
                })}

            </div> 
            :
            <div className="no-restricted-sites-cnt flex-center">
                No Sites
            </div>
        }

    </div>
    )
}

export default RestrictedSites


const AddCurrSiteToRestrictedSite = ({restrictedSites, setRestrictedSites, setToastMsg})=>{
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
                        setRestrictedSites(null)
                        setToastMsg('Added the current site')
                    }}
                >
                    Restrict the current site
                </div>
            </div>
        </div>
        : null
    )
}

