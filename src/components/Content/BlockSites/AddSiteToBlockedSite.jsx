import './AddSiteToBlockedSite.scss'

import { FiPlus } from "react-icons/fi"
import { MdOutlineSubdirectoryArrowLeft as ArrowIcon } from "react-icons/md"
import { useEffect, useRef, useState } from 'react'
import { getHost, isValidUrl } from '../../../utilities/simpleTools'
import { handleBlockUnblockSite } from '../../../localStorage/localSiteTagging'

// *Copied from AddRestrictedSites
const AddSiteToBlockedSite = ({setToastData, getUpdatedBlockedSites, recentSites})=>{
    const [userInput, setUserInput] = useState('')
    const [optionSelectIndex, setOptionSelectIndex] = useState(0)
    const [validRecentSites, setValidRecentSites] = useState([])

    const optionCntRef = useRef(null)
    const inputRef = useRef(null)
    let validRecentSiteRefs = useRef([])

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


    let isUserInputValidUrl = isValidUrl(userInput)





    const handleAddBtnClick = async (hostname)=>{
        handleBlockUnblockSite({
            hostname, shouldBlockSite: true, setToastData
        })


        getUpdatedBlockedSites(null)
        inputRef.current.value = ''
        setUserInput('')

    }

    return (
        <div className={`add-restricted-site-cnt`}
        >

            <div key={0} className="item active">
                {
                    !userInput ?
                    <>  
                        <div className="cell plus-btn-cnt flex-center"
                            title='add site'
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
                    </> : null
                }
                <div className="cell site-input-cnt flex-center">
                    <input 
                        type="text" 
                        className="site-input" 
                        onChange={(e)=>{
                            setUserInput(e.target.value)
                        }}
                        onKeyDown={(e)=>{
                            if (e.key === 'Enter'){
                                handleAddBtnClick(validRecentSites[optionSelectIndex])
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
                        ref={inputRef}

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
                        validRecentSites.map((hostname, index)=>{
                            return (
                                <li 
                                    className={`option ${index === optionSelectIndex ? 'select': ''}`}
                                    key={index}
                                    onClick={()=>{
                                        handleAddBtnClick(hostname)
                                    }}
                                    ref={(ele)=>{
                                        validRecentSiteRefs.current[index] = ele
                                    }}
                                >
                                    <img 
                                        className='option-icon'
                                        src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} 
                                        alt="icon" 
                                    />
                                    <span
                                        className='option-name'
                                    >
                                        {hostname}
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