import { useContext, useEffect, useRef, useState } from "react"
import styles from "./Setting.module.scss"
import { getLocalSettingsData, setLocalSettingsData, updateLocalSettingsData } from "../../../localStorage/localSettingsData"
import { PopupFull, PopupToast } from "../../../utilities/PopupScreens"
import { getFavIconUrlFromGoogleApi, getHost, isValidUrl } from "../../../utilities/simpleTools"

import { BsThreeDotsVertical } from "react-icons/bs"
import { MdClose } from "react-icons/md"
import { GrCircleInformation } from "react-icons/gr"
import { getRecentHostnames } from "../../../utilities/chrome-tools/chromeApiTools"

import { BodyClickContext, LocalFavIconUrlDataContext } from '../../context'
import { checkHostnameArrReference, delHostnameReference } from "../../../utilities/localStorageRelatedUtilities"
import { getBlockedSites, getRestrictedSites, getTimelimitedSites, handleBlockUnblockSite, handleRestrictUnRestrictSite, updateLocalSiteTagging } from "../../../localStorage/localSiteTagging"

import SiteTimeLimitScreen from "../ScreenTime/RecentSitesTimeLimitScreen"
import NavBar from "../NavBar/NavBar"


// todo: create a structure for valid option values
const sectionDataCollection = [ 
    {
        headingText: '🗝️Privacy',
        options: [
            {
                key: 'ignore-sites',
                optionType: 'add-sites',
                getData: async () => {
                    return await getLocalSettingsData({key: 'ignore-sites'})
                },
                subHeadingText: 'Ignore sites',
                descText: `Added sites are NOT tracked by 
                the extension in any means`,
                handleDeleteClick: async ({deleteItem})=>{
                    const settingsData = await getLocalSettingsData({})
                    await updateLocalSettingsData({
                        key: 'ignore-sites',
                        data:  settingsData['ignore-sites'].filter((item)=> item != deleteItem),
                        optionalData: deleteItem
                    })
                },
                addToastData: ['The site is ignored', 'green'],
                removeToastData: ['The site is removed', 'red'],
                popupData: {
                    headingText: 'Ignore site list',
                    handleUnchecked: async ({uncheckedSite, setToastData})=>{
                        const ignoreSites = await getLocalSettingsData({
                            key:  'ignore-sites',
                        })
                        const newIgnoreSites = ignoreSites.filter((site)=> site != uncheckedSite)
                        await updateLocalSettingsData({
                            key: 'ignore-sites',
                            data:  newIgnoreSites,
                            optionalData: uncheckedSite
                        })

                        return newIgnoreSites
                    },
                    handleChecked: async ({checkedSite, setToastData})=>{
                        const ignoreSites = await getLocalSettingsData({
                            key:  'ignore-sites',
                        })

                        ignoreSites.push(checkedSite)

                        await updateLocalSettingsData({
                            key: 'ignore-sites',
                            data:  ignoreSites,
                            optionalData: checkedSite
                        })

                        return ignoreSites
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
                optionType: 'toggle',
                getIsActive: async ()=>{
                    return await getLocalSettingsData({key: 'should-show-notification'})
                },
                updateIsActive: async (isActive)=>{
                    return await updateLocalSettingsData({key: 'should-show-notification', data: isActive})
                },
                subHeadingText: 'Show notificaiton on webpages',
                descText: `Notification card might be showed inside webpages before restricting or time limit exceeding,
                to warn you`,
                enableToastData: ['Notification card enabled', 'green'],
                disableToastData: ['Notification card disabled', 'red']
            },
            {
                key: 'access-webpage',
                optionType: 'toggle', 
                getIsActive: async ()=>{
                    return await getLocalSettingsData({key: 'access-webpage'})
                },
                updateIsActive: async (isActive)=>{
                    return await updateLocalSettingsData({key: 'access-webpage', data: isActive})
                },
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
                optionType: 'toggle',
                getIsActive: async ()=>{
                    return await getLocalSettingsData({key: 'should-count-screen-time-bg-audio'})
                },
                updateIsActive: async (isActive)=>{
                    return await updateLocalSettingsData({key: 'should-count-screen-time-bg-audio', data: isActive})
                },
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
                optionType: 'add-sites',
                getData: async () => {
                    return []
                },
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
                getData: async () => {
                    return []
                },
                subHeadingText: 'Distracted site list',
                descText: `The sites are distracted by this extention while you are in focus mode`,
                popupData: {
                    headingText: 'Distracted site list',
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
            {
                key: 'time-limited-list',
                optionType: 'add-sites', 
                getData: async () => {
                    return []
                },
                subHeadingText: 'Screen time limited sites',
                descText: `A certain time limit is set for sites for each day.`,
                popupData: {
                    key: 'time-limited-list',
                    headingText: 'Screen time limited sites',
                    handleUnchecked: async ({uncheckedSite, setToastData})=>{
    
                        return await getTimelimitedSites()
                    },
                    handleChecked: async ({checkedSite, setToastData})=>{
                        return await getTimelimitedSites()

                    },
                    getCheckedSites: async ()=>{
                        return await getTimelimitedSites()
                    },
                    shouldShowRemoveData: false,
                    shouldShowTimeLimit: true
                }
            },
        ]
    },
]

const Setting = ({setNavSelect})=>{
    const [popupScreenData, setPopupScreenData] = useState(null)
    const [toastData, setToastData] = useState([null, null]) //* Toast Message from bottom

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
                        popupScreenData.key === 'time-limited-list' ?
                        <SiteTimeLimitScreen 
                            setToastData={setToastData}
                            setClosePopup={()=>setPopupScreenData(null)}
                        />  :
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
            <NavBar 
                setNavSelect={setNavSelect}
                navDetailsArr={[['Settings', 'settings']]}
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
                                        getIsActive, 
                                        setIsActive,
                                        key
                                    }  = optionData
                
                                    return (
                                    optionType === 'toggle' ?
                                    <ToggleOption 
                                        key={optionData.key}
                                        optionData={optionData}
                                        setToastData={setToastData}
                                        /> : 
                                    optionType === 'add-sites' ? 
                                    <AddOption 
                                        key={key}
                                        optionData={optionData}
                                        popupScreenData={popupScreenData}
                                        setPopupScreenData={setPopupScreenData}
                                        setToastData={setToastData}
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

function AddOption({optionData, popupScreenData, setPopupScreenData, setToastData}){
    const {
        key,
        subHeadingText,
        descText,
        handleDeleteClick,
        removeToastData,
        getData,
        popupData
    } = optionData

    const [addedItems, setAddedItems] = useState([])
    const bodyClickCount = useContext(BodyClickContext)
    const localFavIconUrlData = useContext(LocalFavIconUrlDataContext)
    const getFavIcon = (hostname)=>{
        return localFavIconUrlData[hostname] || getFavIconUrlFromGoogleApi(hostname)
    }

    const [optionActiveArr, setOptionActive] = useState(addedItems.map(s=>false))

    useEffect(()=>{
        if (optionActiveArr.includes(true)){
            setOptionActive(addedItems.map(s=>false))
        }
    }, [bodyClickCount])

    useEffect(()=>{
        getData().then(val=>{
            setAddedItems(val)
            setOptionActive(val.map(s=>false))
        })
    }, [popupScreenData])

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
                            <img src={getFavIcon(item)} alt="icon" />
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
                                {
                                    handleDeleteClick && 
                                    <div className={styles.HostOption}
                                        onClick={async (e)=>{
                                            await handleDeleteClick({deleteItem: item})
                                            const value = await getData()

                                            setAddedItems(value)
                                            setOptionActive(value.map(s=>false))
                                            setToastData(removeToastData)
                                        }}
                                    >
                                        Delete
                                    </div>
                                }
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

function ToggleOption({optionData, setToastData}){
    const {
        key,
        getIsActive,
        updateIsActive
    } = optionData
    const [isActive, setIsActive] = useState(null)

    useEffect(()=>{
        getIsActive().then((tempIsActive)=>setIsActive(tempIsActive))
    })
    const {
        subHeadingText,
        descText,
        enableToastData, 
        disableToastData,
    } = optionData



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

                        await updateIsActive(newIsActive)
                        setIsActive(newIsActive)

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

    const localFavIconUrlData = useContext(LocalFavIconUrlDataContext)
    const getFavIcon = (hostname)=>{
        return localFavIconUrlData[hostname] || getFavIconUrlFromGoogleApi(hostname)
    }

    
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
        const tempHostnameArrReference = await checkHostnameArrReference(tempCheckedSiteList)

        setHostnameReferenceArr(tempHostnameArrReference)
        setCheckedSites(tempCheckedSiteList)

        setSearchText('')
    }
    const handleBeforeChecked = async (checkedSite)=>{
        const tempCheckedSiteList = await handleChecked({checkedSite, setToastData})

        setHostnameReferenceArr(await checkHostnameArrReference(tempCheckedSiteList))
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
                            handleBeforeUnchecked(serachTextToValidHostName)
                        }}
                        >
                        <div className={styles.SiteItemCnt}>
                            <div className={styles.SiteItemCheckBoxCnt}>
                                <input type="checkbox" 
                                    className={styles.SiteItemCheckBox}
                                />
                            </div>
                            <img className={styles.SiteItemIcon}
                                src={getFavIcon(serachTextToValidHostName)} 
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
                                    handleBeforeUnchecked(hostname)
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
                                        src={getFavIcon(hostname)} 
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
                                                        setHostnameReferenceArr(hostnameArrReference)

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
                                        src={getFavIcon(hostname)} 
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