import { useContext, useEffect, useRef, useState } from "react"
import styles from "./Setting.module.scss"
import { getLocalSettingsData, setLocalSettingsData, updateLocalSettingsData } from "../../../localStorage/localSettingsData"
import { PopupFull, PopupToast } from "../../../utilities/PopupScreens"
import { getHost, isValidUrl } from "../../../utilities/simpleTools"

import { BsThreeDotsVertical } from "react-icons/bs"
import { MdClose } from "react-icons/md"
import { GrCircleInformation } from "react-icons/gr"
import { getRecentHostnames } from "../../../utilities/chrome-tools/chromeApiTools"
import { FaHourglass, FaRegHourglass } from "react-icons/fa"
import { BodyClickContext } from '../../context'
import { checkHostnameArrReference, delHostnameReference } from "../../../utilities/localStorageRelatedUtilities"
import { getBlockedSites, getRestrictedSites, handleBlockUnblockSite, handleRestrictUnRestrictSite, updateLocalSiteTagging } from "../../../localStorage/localSiteTagging"


// todo: create a structure for valid option values
const sectionDataCollection = [ 
    {
        headingText: '🗝️Privacy',
        options: [
            {
                key: 'ignore-sites',
                optionType: 'add-sites', // toggle, multiple-option
                subHeadingText: '🧹Ignore sites',
                descText: `Added sites are NOT tracked by 
                the extension in any means`,
                handleDeleteClick: async ({setSettingsData, settingsData, key, deleteItem})=>{
                    const newSettingsData = await updateLocalSettingsData({
                        key: 'ignore-sites',
                        data:  settingsData[key].filter((item)=> item != deleteItem),
                        optionalData: deleteItem
                    })
                                
                    setSettingsData(newSettingsData)
                },
                addToastData: ['The site is ignored', 'green'],
                removeToastData: ['The site is removed', 'red'],
                popupData: {
                    headingText: 'Ignore site list',
                    handleUnchecked: async ({uncheckedSite, setToastData})=>{
                        const ignoreSites = await getLocalSettingsData({
                            key:  'ignore-sites',
                        })
                        await updateLocalSettingsData({
                            key: 'ignore-sites',
                            data:  ignoreSites.filter((site)=> site != uncheckedSite),
                            optionalData: uncheckedSite
                        })

                    },
                    handleChecked: async ({checkedSite, setToastData})=>{
                        const ignoreSites = await getLocalSettingsData({
                            key:  'ignore-sites',
                        })
                        await updateLocalSettingsData({
                            key: 'ignore-sites',
                            data:  ignoreSites.push(checkedSite),
                            optionalData: checkedSite
                        })
                    },
                    getCheckedSites: async ()=>{
                        return await getLocalSettingsData({
                            key:  'ignore-sites',
                            
                        })
                    },
                    shouldShowRemoveData: true
                },
            },
            {
                key: 'should-show-notification',
                optionType: 'toggle', // toggle || multiple-option
                subHeadingText: 'Show notificaiton on webpages',
                descText: `Notification card might be showed inside webpages before restricting or time limit exceeding,
                to warn you`,
                enableToastData: ['Notification card enabled', 'green'],
                disableToastData: ['Notification card disabled', 'red']
            },
            {
                key: 'access-webpage',
                optionType: 'toggle', // toggl || multiple-option
                subHeadingText: 'Give webpage access permission',
                descText: `This permission helps the extension to show the Notification Card in webpages.`,
                enableToastData: ['Webpage access enabled', 'green'],
                disableToastData: ['Webpage access disabled', 'red']
            },
        ]
    },
    {
        headingText: '⌚Screen Time',
        options: [
            {
                key: 'should-count-screen-time-bg-audio',
                optionType: 'toggle', // toggle || multiple-option
                subHeadingText: 'Background audio - count screen time',
                descText: `Consider screen time even when a tab play auido in background`,
                enableToastData: ['Turned on', 'green'],
                disableToastData: ['Turned off', 'red']
            }
        ]
    },
    {
        headingText: '🕸️Websites',
        options: [
            {
                key: 'block-list',
                optionType: 'add-sites', // toggle, multiple-option
                subHeadingText: 'Blocked site list',
                descText: `The sites are blocked by this extention to avoid distraction`,
                popupData: {
                    headingText: 'Blocked site list',
                    handleUnchecked: async ({uncheckedSite, setToastData})=>{
                        await handleBlockUnblockSite({
                            hostname: uncheckedSite,
                            shouldBlockSite: false,
                            setToastData
                        })
    
                        return await getBlockedSites()
                    },
                    handleChecked: async ({checkedSite, setToastData})=>{
                        await handleBlockUnblockSite({
                            hostname: checkedSite,
                            shouldBlockSite: true,
                            setToastData
                        })
    
                        return await getBlockedSites()
                    },
                    getCheckedSites: async ()=>{
                        return await getBlockedSites()
                    },
                    shouldShowRemoveData: false
                }
            },            
            {
                key: 'restricted-list',
                optionType: 'add-sites', 
                subHeadingText: 'Restricted site list',
                descText: `The sites are restricted by this extention while you are in focus mode`,
                popupData: {
                    headingText: 'Restricted site list',
                    handleUnchecked: async ({uncheckedSite, setToastData})=>{
                        await handleRestrictUnRestrictSite({
                            hostname: uncheckedSite,
                            shouldRestrictSite: false,
                            setToastData
                        })
    
                        return await getRestrictedSites()
                    },
                    handleChecked: async ({checkedSite, setToastData})=>{
                        await handleRestrictUnRestrictSite({
                            hostname: checkedSite,
                            shouldRestrictSite: true,
                            setToastData
                        })
    
                        return await getRestrictedSites()
                    },
                    getCheckedSites: async ()=>{
                        return await getRestrictedSites()
                    },
                    shouldShowRemoveData: false
                }
            },
        ]
    },



]

const SettingsHeading = ({setNavSelect}) =>{

    return (
        <h2 className={styles.Heading} onClick={()=> setNavSelect('block-site')}>
            <span className={styles.Title}>Home</span>
            <span >{'>'}</span>
            <span className={styles.Title}>Setting</span>
        </h2>
    )
    
}
const Setting = ({setNavSelect})=>{
    const [settingsData, setSettingsData] = useState(null)
    const [popupScreenData, setPopupScreenData] = useState(null)
    const [toastData, setToastData] = useState([null, null]) //* Toast Message from bottom

    useEffect(()=>{
        getLocalSettingsData({}).then((sD) => setSettingsData(sD))
    }, [])

    if (settingsData === null){
        return <div>Loading...</div>
    }

    const [toastMsg, toastColorCode] = toastData

    return (
        <div className={styles.OutterCnt}>
            {
                toastMsg &&
                <PopupToast
                    key={'popup-toast'}
                    toastData={toastData}
                    setToastData={setToastData}
                /> 
            }
            {
                popupScreenData && 
                <PopupFull setClosePopup={()=>setPopupScreenData(null)}>
                    {
                        <CheckListPopup 
                            popupScreenData={popupScreenData}
                            setClosePopup={()=>{
                                setPopupScreenData(null)
                            }}
                            setToastData={setToastData}
                        />
                    }
                </PopupFull> 
            }
            <SettingsHeading 
                setNavSelect={setNavSelect} 
            />
            {
                sectionDataCollection.map(sectionData => {
                    return (
                    <div className={styles.Cnt}
                        key={sectionData.headingText}
                    >
                        <h3 className={styles.OptionHeading}>
                            {sectionData.headingText}
                        </h3>
                        <div className={styles.OptionsOuterCnt}>
                            {
                                sectionData.options.map((optionData)=>{
                                    const {
                                        optionType, 
                                        popupData, 
                                        optionDataItems, 
                                        key
                                    }  = optionData
                
                                    return (
                                    optionType === 'toggle' ?
                                    <ToggleOption 
                                        key={optionData.key}
                                        settingsData={settingsData}
                                        optionData={optionData}
                                        setSettingsData={setSettingsData}
                                        setToastData={setToastData}
                                        
                                        /> :
                                    optionType === 'add-sites' ? 
                                    <AddOption 
                                        optionData={optionData}
                                        key={key}
                                        optionDataItems={optionDataItems}
                                        setPopupScreenData={setPopupScreenData}
                                        settingsData={settingsData}
                                        setSettingsData={setSettingsData}
                                        setToastData={setToastData}
                                        popupData={popupData}
                
                                    /> : null
                                )
                
                                })
                            }
                        </div>
                    </div>
                    )
                })
            }


        </div>
    )
}

export default Setting

function AddOption({optionData, setPopupScreenData, settingsData, setSettingsData, setToastData, popupData}){
    const addedItems = settingsData[optionData.key] ?? []
    const bodyClickCount = useContext(BodyClickContext)
    const [optionActiveArr, setOptionActive] = useState(addedItems.map(s=>false))

    useEffect(()=>{
        if (optionActiveArr.includes(true)){
            setOptionActive(settingsData[optionData.key].map(s=>false))
        }
    }, [bodyClickCount])

    useEffect(()=>{
        setOptionActive(addedItems.map(s=>false))
    }, [settingsData[optionData.key]])

    const {
        key,
        optionType,
        subHeadingText,
        descText,
        handleDeleteClick,
        addToastData, 
        removeToastData,
    } = optionData




    return (
    <div className={styles.AddOptionCnt}>
        <div className={styles.AddOptionTitleCnt}>
            <div className={styles.OptionDescCnt}>
                <h4 className={styles.OptionSubHeading}>
                    {subHeadingText}
                </h4>
                <span className={styles.OptionDescText}>
                    {descText}
                </span>
            </div>
            <div className={styles.AddBtnCtn}>
                <button
                    onClick={()=>{
                        setPopupScreenData(popupData)
                    }}
                
                >
                    Edit
                </button>
            </div>
        </div>
        {

        addedItems.length > 0 ? 
        <ul className={styles.AddOptionListCnt}>
        {
            addedItems.map((item, index)=>{
                return (
                    <li key={item}> 
                        <div className={styles.HostIconCnt}>
                            <img src={`http://www.google.com/s2/favicons?domain=${item}&sz=${128}`} alt="icon" />
                        </div>
                        <div className={styles.Hostsite}>
                            {item}
                        </div>
        
                        <div className={styles.HostOptionIconCnt}
                            onClick={(e)=>{
                                
                                e.stopPropagation()
        
                                const newOptionActiveArr = [...optionActiveArr]
                                newOptionActiveArr[index] = !newOptionActiveArr[index]
        
                                setOptionActive(
                                    optionActiveArr.map(
                                        (isActive, optionActiveArrIndex)=> index === optionActiveArrIndex
                                    )
                                )
                            }}
                        >
                            <BsThreeDotsVertical />
                        </div>
                        {
                            optionActiveArr[index] ? 
                            <div className={styles.HostOptionPopup}
                                onClick={()=>{
                                    setOptionActive(addedItems.map(s=>false))
                                }}
                            >
                                <div className={styles.HostOption}
                                    onClick={(e)=>{
                                        setPopupScreenData(popupData)
                                    }}
                                >
                                    Edit
                                </div>
                                <div className={styles.HostOption}
                                    onClick={(e)=>{
                                        handleDeleteClick({setSettingsData, settingsData, 
                                            key, deleteItem: item})
                                        setToastData(removeToastData)
                                    }}
                                >
                                    Delete
                                </div>
                            </div> : null
                        }
        
                    </li>
                )})
        }                   
        </ul> : null
            // <div className={styles.NoSites}>
            //     No sites
            // </div>
        }
    </div>
    )
}

function ToggleOption({settingsData, optionData, setSettingsData, setToastData}){
    const {
        key,
        optionType,
        subHeadingText,
        descText,
        enableToastData, 
        disableToastData,
    } = optionData

    const isActive = settingsData[key]


    return (
            <div className={styles.ToggleOptionCnt}>
                <div className={styles.OptionDescCnt}>
                    <h4 className={styles.OptionSubHeading}>
                        {subHeadingText}
                    </h4>
                    <span className={styles.OptionDescText}>
                        {descText}
                    </span>
                </div>
                <div className={styles.OptionToggle}
                    onClick={async ()=>{
                        const newIsActive = !isActive 

                        const newSettingsData = await updateLocalSettingsData({
                            key: optionData.key,
                            data: newIsActive,
                        })
                        setSettingsData(newSettingsData)


                        if (newIsActive) setToastData(enableToastData)
                        else setToastData(disableToastData)
                    }}
                >
                    <div 
                        className={`${styles.Bar} ${isActive ? styles.Active : null}`}
                    >
                        <div 
                            className={`${styles.Knob} ${isActive ? styles.Active : null}`}
                        >
                            
                        </div>
                    </div>
                </div>
            </div>
    )
    
}

const CheckListPopup = ({
    setClosePopup, setToastData, popupScreenData, 
})=>{
    const {
        getCheckedSites, 
        headingText,
        handleUnchecked,
        handleChecked,
        shouldShowRemoveData
    } = popupScreenData

    const [recentSites, setRecentSites] = useState([])
    const [searchText, setSearchText] = useState('')
    const [checkedSites, setCheckedSites] = useState([])
    const [hostnameReferenceArr, setHostnameReferenceArr] = useState([])

    
    useEffect(()=>{
        getData()
    }, [])

    const getData = async () =>{
        const tempRecentSites = await getRecentHostnames()
        const tempCheckedSites = await getCheckedSites()
        const tempHostnameArrReference = await checkHostnameArrReference(tempCheckedSites)
        
        setCheckedSites(tempCheckedSites)
        setRecentSites(tempRecentSites)
        setHostnameReferenceArr(tempHostnameArrReference)
    }

    const handleBeforeUnchecked = async (uncheckedSite)=>{
        const tempCheckedSiteList = await handleUnchecked({uncheckedSite, setToastData})
        setCheckedSites(tempCheckedSiteList)
        setSearchText('')
    }
    const handleBeforeChecked = async (checkedSite)=>{
        const tempCheckedSiteList = await handleChecked({checkedSite, setToastData})
        setCheckedSites(tempCheckedSiteList)
        setSearchText('')
    }

    let serachTextToValidHostName = null
    let isSearchTextValidSite = false
    if (isValidUrl(searchText)){
        serachTextToValidHostName = getHost(searchText)
        isSearchTextValidSite = serachTextToValidHostName && 
                !recentSites.includes(serachTextToValidHostName) && 
                !checkedSites.includes(serachTextToValidHostName)
    }

    const recentSitesNotCheckedSearchFiltered = recentSites.filter((hostname)=>{
        if (serachTextToValidHostName !== hostname){
            if (searchText && (hostname.search(searchText) < 0)){
                return false
            }
        }

        let isFound = false
        let indexOfCheckedSites = 0

        while(!isFound && indexOfCheckedSites < checkedSites.length){
            isFound = checkedSites.includes(hostname)
            indexOfCheckedSites++
        }
        
        return !isFound
    })


    return (
    <div className={styles.CheckedSiteList}
        onClick={(e)=>{
            e.stopPropagation()
        }}
    >
        <button className={styles.CloseBtn + ' flex-center'}
            onClick={()=> setClosePopup()}
        >
            <MdClose />
        </button>
        <div className={styles.InnerCnt}> 
            <div className={styles.HeadingCnt}>
                <h3 className='heading'>
                    {headingText}
                </h3>
                <div className={styles.SearchBarCnt}>
                    <input className={styles.SearchBar}
                        value={searchText}
                        type="text" 
                        placeholder='Search or paste site'
                        autoFocus
                        onChange={e=>{
                                const typedValue = e.target.value.toLocaleLowerCase() 
                                setSearchText(typedValue)
                            }}
                    />
                </div>
            </div>
            <ul className={styles.SitesCnt}>
                {
                    isSearchTextValidSite ?
                    <li className={styles.SiteItem}
                        key={serachTextToValidHostName}
                        title={serachTextToValidHostName}

                        onClick={async () => {
                            handleBeforeUnchecked({})
                        }}
                        >
                        <div className={styles.SiteItemCnt}>
                            <div className={styles.SiteItemCheckBoxCnt}>
                                <input type="checkbox" 
                                    className={styles.SiteItemCheckBox}
                                />
                            </div>
                            <img className={styles.SiteItemIcon}
                                src={`http://www.google.com/s2/favicons?domain=${serachTextToValidHostName}&sz=${128}`} 
                                alt="icon" 
                            />
                            <span className={styles.HostName}>
                                {serachTextToValidHostName}
                            </span>    
                        </div>
                    </li> : null
                }
                {
                    checkedSites.length > 0 ?
                    checkedSites.map((hostname, index)=>{
                        if (serachTextToValidHostName !== hostname){
                            if (hostname.search(searchText) < 0){
                                return null
                            }
                        }

                        return (
                            <li className={styles.SiteItem}
                                key={hostname}
                                title={hostname}
                                onClick={async () => {
                                    handleBeforeUnchecked()
                                }}
                            >
                                <div className={styles.SiteItemCnt}>
                                    <div className={styles.SiteItemCheckBoxCnt}>
                                        <input type="checkbox" 
                                            className={styles.SiteItemCheckBox}
                                            defaultChecked
                                        />
                                    </div>
                                    <img className={styles.SiteItemIcon}
                                        src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} 
                                        alt="icon" 
                                    />
                                    <div className={styles.TextCnt}>
                                        <span className={styles.HostName}>
                                            {hostname}
                                        </span>
                                        {
                                            shouldShowRemoveData ? 
                                            <>
                                                {
                                                hostnameReferenceArr[index] ?
                                                <span className={styles.RemoveDesc}
                                                    title={null}
                                                    onClick={async (e)=>{
                                                        e.stopPropagation()
                                                        e.preventDefault()

                                                        const isDeleted = await delHostnameReference(hostname)

                                                        const hostnameArrReference = await checkHostnameArrReference(checkedSites)
                                                        setCheckedSites(hostnameArrReference)

                                                    }}
                                                >
                                                    Remove data in the extension
                                                </span> : 
                                                <span
                                                    className={styles.RemovedDesc}
                                                    onClick={async (e)=>{
                                                        e.stopPropagation()
                                                        e.preventDefault()
                                                    }}
                                                >
                                                    No data
                                                </span>
                                                }
                                            </> : null
                                        }
                                    </div>
                                </div>
                            </li>
                        )
                    }) : (
                        <li className={styles.NoSiteItem}>
                            No sites
                        </li>
                    )
                }

                {
                    recentSitesNotCheckedSearchFiltered.length > 0 ?
                    <li className={styles.HeaderCnt}>
                        <span className={styles.Icon}>
                            <GrCircleInformation />
                        </span>
                        <span className={styles.Header}>
                            Recent sites
                        </span>
                    </li> : null
                }
                {
                    recentSitesNotCheckedSearchFiltered.length > 0 ?
                    recentSitesNotCheckedSearchFiltered.map((hostname)=>{

                        return (
                            <li className={styles.SiteItem}
                                key={hostname}
                                title={hostname}
                                onClick={async () => {
                                    handleBeforeChecked(hostname)
                                }}
                            >
                                <div className={styles.SiteItemCnt}>
                                    <div className={styles.SiteItemCheckBoxCnt}>
                                        <input type="checkbox"  
                                            className={styles.SiteItemCheckBox}
                                        />
                                    </div>
                                    <img className={styles.SiteItemIcon}
                                        src={`http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`} 
                                        alt="icon" 
                                    />
                                    <span className={styles.HostName}>
                                        {hostname}
                                    </span>    
                                </div>
                            </li>
                        )
                    }) : (
                        <li className={styles.NoSiteItem}>
                            No recent sites to show
                        </li>
                    )
                }
            </ul>
        </div>
    </div>
    )
}

const getTotalTimeInMin = ([hours, minutes]) => {
    return (hours * 60) + minutes
}

const getTimeShowText  = ([hours, minutes]) => {
    let text = ''
    if (hours > 0){
        text += `${hours}h `
    }

    if (minutes > 0){
        text += `${minutes}m`
    }
    return text

}