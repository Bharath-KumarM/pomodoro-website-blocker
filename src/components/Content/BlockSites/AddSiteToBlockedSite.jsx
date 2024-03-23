import './AddSiteToBlockedSite.scss'

import { FiPlus } from "react-icons/fi"
import { MdOutlineSubdirectoryArrowLeft as ArrowIcon } from "react-icons/md"
import { useContext, useEffect, useRef, useState } from 'react'
import { getFavIconUrlFromGoogleApi, getHost, isValidUrl } from '../../../utilities/simpleTools'
import { handleBlockUnblockSite } from '../../../localStorage/localSiteTagging'
import { getLocalSettingsData } from '../../../localStorage/localSettingsData'
import { LocalFavIconUrlDataContext } from '../../context'

// *Copied from AddRestrictedSites
const AddSiteToBlockedSite = ({setToastData, getUpdatedBlockedSites, recentSites})=>{
    const [userInput, setUserInput] = useState('')
    const [ignoreSites, setIgnoreSites] = useState([])
    const [optionSelectIndex, setOptionSelectIndex] = useState(0)
    const [validRecentSites, setValidRecentSites] = useState([])

    const localFavIconUrlData = useContext(LocalFavIconUrlDataContext)
    const getFavIcon = (hostname)=>{
        return localFavIconUrlData[hostname] || getFavIconUrlFromGoogleApi(hostname)
    }

    const optionCntRef = useRef(null)
    let validRecentSiteRefs = useRef([])

    useEffect(()=>{
        getLocalSettingsData({key: 'ignore-sites'}).then((tempIgnoreSites) => setIgnoreSites(tempIgnoreSites))

    })

    useEffect(()=>{
        let tempValidRecentSites = []
        if (userInput.startsWith('http') && isValidUrl(userInput)){
            tempValidRecentSites.push(getHost(userInput))
        }
        else{
            tempValidRecentSites = recentSites.filter((hostname)=>hostname.includes(userInput))
            tempValidRecentSites.push(userInput)
        }
        // Empty the ref, eventually added in list render
        validRecentSiteRefs.current = validRecentSiteRefs.current.slice(0, tempValidRecentSites.length);
        setValidRecentSites(tempValidRecentSites)

    }, [userInput])

    const handleAddBtnClick = async (hostname)=>{
        handleBlockUnblockSite({
            hostname, shouldBlockSite: true, setToastData
        })

        getUpdatedBlockedSites(null)
        setUserInput('')
    }

    const hostname = getHost(userInput)

    return (
        <div className={`add-restricted-site-cnt`}
        >

            <div key={0} className="item active">
                {
                    !userInput &&
                    <div className="cell plus-btn-cnt flex-center"
                        title='add site'
                    >
                        <div className={`inner-cnt flex-center `}>
                            <FiPlus />
                        </div>
                    </div>
                }
                <div className="cell site-input-cnt flex-center">
                    <input 
                        type="text" 
                        className="site-input" 
                        onChange={(e)=>{
                            setUserInput(e.target.value)
                            e.preventDefault()
                        }}
                        value={userInput}
                        onKeyDown={(e)=>{
                            if (['ArrowUp', 'ArrowDown'].includes(e.code)){
                                e.preventDefault()
                            }

                            if (['Escape'].includes(e.code)){
                                
                            }
                            if (e.key === 'Enter'){
                                if (ignoreSites.includes(validRecentSites[optionSelectIndex])){
                                    setToastData(["Ignored site can't be added", 'red'])
                                    setUserInput('')
                                } else{
                                    handleAddBtnClick(validRecentSites[optionSelectIndex])
                                }
                            }
                            if (e.key === 'ArrowDown'){

                                setOptionSelectIndex(prevIndex=>{
                                    let index
                                    if (validRecentSites.length -1 <= prevIndex){
                                        index = 0
                                    }
                                    else  index = prevIndex+1
                                    
                                    // *Scrolls
                                    const siteRef = validRecentSiteRefs.current[index]
                                    const elePosition = siteRef.offsetTop
                                    optionCntRef.current.scrollTop = elePosition-100

                                    return index
                                })
                                
                            }
                            if (e.key === 'ArrowUp'){
                                
                                setOptionSelectIndex(prevIndex=>{
                                    let index
                                    if (prevIndex=== 0){
                                        index = validRecentSites.length - 1
                                    }
                                    else  index = prevIndex-1
                                    
                                    // *Scrolls
                                    const siteRef = validRecentSiteRefs.current[index]
                                    const elePosition = siteRef.offsetTop
                                    optionCntRef.current.scrollTop = elePosition-100
                                    
                                    return index
                                })
                            }
                        }}
                        placeholder={"Type to block sites"}
                        list="site-list"
                    />
                </div>
            </div>
            {
                !userInput ? null :
                <div className='options-cnt'
                    ref={optionCntRef}
                >
                    {
                        validRecentSites.length === 1 ? null :
                        <h3 className='option-heading'>
                            Suggesting recently visited sites
                        </h3>
                    }
                    {
                        validRecentSites.map((recentHostname, index)=>{
                            const isSiteIgnored = ignoreSites.includes(recentHostname)
                            return (
                                <li 
                                    className={`option ${index === optionSelectIndex ? 'select': ''} ${isSiteIgnored ? 'ignored' : ''}`}
                                    key={index}
                                    onClick={()=>{
                                        if (isSiteIgnored){
                                            setToastData(["Ignored site can't be added", 'red'])
                                            setUserInput('')
                                        } else{
                                            handleAddBtnClick(recentHostname)
                                        }
                                    }}
                                    ref={(ele)=>{
                                        validRecentSiteRefs.current[index] = ele
                                    }}
                                >
                                    <img 
                                        className='option-icon'
                                        src={getFavIcon(recentHostname)} 
                                        alt={recentHostname}
                                    />
                                    <span
                                        className={`option-name ${isSiteIgnored ? 'ignored' : ''}`}
                                    >
                                        {recentHostname}
                                    </span>
                                    {
                                        index !== optionSelectIndex ? null :
                                        <span
                                            className='option-plus-icon flex-center'
                                        >
                                            <ArrowIcon />
                                        </span>
                                    }
                                </li>
                            )
                        })
                    }

                

                </div>  
            }
        </div>
    )
}

export default AddSiteToBlockedSite