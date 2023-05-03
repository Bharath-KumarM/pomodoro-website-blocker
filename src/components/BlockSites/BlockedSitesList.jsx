import { ImCheckboxUnchecked as UncheckedIcon, ImCheckboxChecked as CheckedIcon } from "react-icons/im"
import { BiMemoryCard as SaveIcon } from "react-icons/bi"
import {ImBlocked} from "react-icons/im"
import { FiPlus } from "react-icons/fi"

import { useEffect, useState, useRef } from "react"

import { getHost, isValidUrl } from "../../utilities/simpleTools"
import { blockOrUnblockSite, getCurrTab } from "../../utilities/chromeApiTools"

const BlockedSitesList = ({blockedSites, handleShowBtnClick, setToastMsg}) => {
    const [isUnsaved, setIsUnsaved] = useState(false)
    const [isSelectArr, setIsSelectArr] = useState(Object.keys(blockedSites).map(()=>true))

    useEffect(()=>{
        // Initialize this two state
        setIsSelectArr(Object.keys(blockedSites).map(()=>true))
        setIsUnsaved(false)
    }, [blockedSites])

    const blockedSiteElements = []
    const hostFavArr = []
    Object.keys(blockedSites).map((hostname, id)=>{
        const favIconUrl = blockedSites[hostname][0]
        hostFavArr.push([hostname, favIconUrl])
        
        blockedSiteElements.push(
            <BlockSiteEntry 
                id={id}
                hostname={hostname}
                favIconUrl={favIconUrl}
                isSelectArr={isSelectArr}
                setIsSelectArr={setIsSelectArr}
                setIsUnsaved={setIsUnsaved}
            />
        )
    })

    const handleSelectAllClicked = ()=>{
        setIsSelectArr(Object.keys(blockedSites).map(()=>true))
        setIsUnsaved(true)

    }
    const handleUnselectAllClicked = ()=>{
        setIsSelectArr(Object.keys(blockedSites).map(()=>false))
        setIsUnsaved(true)

    }
    
    const handleSaveClicked = ()=>{
        const tempBlockedSites = {}
        isSelectArr.map((isSelected, index)=>{
            if (isSelected){
                const [entryHost, entryFav] = hostFavArr[index]
                tempBlockedSites[entryHost] = [entryFav]
            }
        })
        chrome.storage.local.set({'blockedSites': tempBlockedSites}, ()=>{
            setIsUnsaved(false)
        })
        setToastMsg('Saved')

    }

    return (
        <>
            <hr class="hr-line"></hr>
            <div className="sticky">
                <div className="heading">
                    <ImBlocked />
                    <h3> Blocked Sites </h3>
                </div>
                <div className="btn-cnt">
                    <button
                        onClick={()=>handleSelectAllClicked()}
                    >   
                        <CheckedIcon />
                        <div>
                            Select all
                        </div>
                    </button>
                    <button
                        onClick={()=>handleUnselectAllClicked()}
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
            <AddCurrSiteToBlockedSite 
                setToastMsg={setToastMsg}
                blockedSites={blockedSites}
                handleShowBtnClick={handleShowBtnClick}
            />
            <AddSiteToBlockedSite 
                setToastMsg={setToastMsg}
                handleShowBtnClick={handleShowBtnClick}
            />
            <table class="block-site-list-table">
                {blockedSiteElements}
            </table>
        </>
    )

}

export default BlockedSitesList

const AddSiteToBlockedSite = ({handleShowBtnClick, setToastMsg})=>{
    const [userInput, setUserInput] = useState('')
    const inputRef = useRef(null)

    let isUserInputValidUrl = isValidUrl(userInput)

    const handleAddBtnClick = async ()=>{
        // Add Block clicked
        if (!isUserInputValidUrl){
            setToastMsg('Invalid site')
            return null;
        }
        const res = await blockOrUnblockSite(true, getHost(userInput), null)
        if (res){
            setToastMsg('Blocked Site')
        }
        else{
            setToastMsg('Error on adding Blocked Site')
        }
        inputRef.current.value = ''
        setUserInput('')
        handleShowBtnClick()
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

const BlockSiteEntry = ({id, hostname, favIconUrl, isSelectArr, setIsSelectArr, setIsUnsaved})=>{

    const handleEntryClick = () =>{
        setIsUnsaved(true)
        setIsSelectArr(prevIsSelectArr=>{
            prevIsSelectArr[id] = !prevIsSelectArr[id]
            return [...prevIsSelectArr]
        })
    }

    return (
        <tr
            key={id}
            onClick={e => handleEntryClick() }
            >
            <td>
                <input 
                    type="checkbox" 
                    checked={isSelectArr[id]} 
                    />
            </td>
            <td>
                {
                    favIconUrl ? 
                    <img src={favIconUrl} alt="icon" />
                    :
                    <img src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} alt="icon" />
                }
            </td>
            <td className="site"> {hostname} </td>
        </tr>
    )
}

const AddCurrSiteToBlockedSite = ({blockedSites,handleShowBtnClick, setToastMsg})=>{
    const [currSiteDetails, setCurrSiteDetails] = useState([null, null])

    useEffect(()=>{
        getCurrTab().then(({url,favIconUrl})=>{
            if (url.startsWith('http')){
                const hostname = getHost(url)
                // *check whether the curr hostname present in block sites list 
                if (Object.keys(blockedSites).includes(hostname)) setCurrSiteDetails([null, null])
                else setCurrSiteDetails([hostname, favIconUrl])
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
                        const res = await blockOrUnblockSite(true, currSiteHostname, currSiteFavIconUrl)
                        if (res){
                            setToastMsg('Blocked site')
                            setCurrSiteDetails([null, null])
                        } else{
                            setToastMsg('Error on blocking the site')
                        }
                        handleShowBtnClick()
                    }}
                >
                    Block the current site
                </div>
            </div>
        </div>
        : null
    )
}