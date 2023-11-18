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


// todo: create a structure for valid option values
const sectionDataCollection = [ 
    {
        headingText: 'Screen Time',
        options: [
            {
                key: 'should-count-screen-time-bg-audio',
                optionType: 'toggle', // toggle || multiple-option
                subHeadingText: 'Count screen time',
                descText: `count screen time while playing audio in the background`,
                enableToastData: ['Turned on', 'green'],
                disableToastData: ['Turned off', 'red']
            }
        ]
    },
    {
        headingText: 'Privacy',
        options: [
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
            {
                key: 'ignore-sites',
                optionType: 'add-sites', // toggle, multiple-option
                subHeadingText: 'Ignore sites',
                descText: `Added sites are NOT accessed and tracked by 
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
                removeToastData: ['The site is removed', 'red']
            },


        ]
    },


]
const Setting = ({setNavSelect})=>{
    const [settingsData, setSettingsData] = useState(null)
    const [showPopUpScreen, setShowPopupScreen] = useState(null) // null || 'ignore-sites' ||
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
                    toastMsg ?
                    <PopupToast
                        key={'popup-toast'}
                        toastData={toastData}
                        setToastData={setToastData}
                    /> : null
                }
            {
                showPopUpScreen !== null ? 
                <PopupFull
                    setClosePopup={()=>{
                        setShowPopupScreen(null)
                    }}
                >
                    {
                        showPopUpScreen === 'ignore-sites' ?
                        <IgnoreSiteList 
                            settingsData={settingsData}
                            setSettingsData={setSettingsData}
                            setClosePopup={()=>{
                                setShowPopupScreen(null)
                            }}
                            setToastData={setToastData}
                        /> : null
                    }
                </PopupFull> : null
            }
            <h2 className={styles.Heading}
                onClick={()=>{
                    setNavSelect('block-site')
                }}
            >
                <span className={styles.Title}>Home</span>
                <span >{'>'}</span>
                <span className={styles.Title}>Setting</span>
            </h2>

            {
                sectionDataCollection.map(sectionData => {
                    return (
                        <SettingsSection 
                            sectionData={sectionData}
                            setSettingsData={setSettingsData}
                            setShowPopupScreen={setShowPopupScreen}
                            settingsData={settingsData}
                            key={sectionData.headingText}
                            setToastData={setToastData}
                        />
                    )
                })
            }


        </div>
    )
}

export default Setting

const SettingsSection = ({
    sectionData, 
    settingsData, 
    setSettingsData, 
    setShowPopupScreen,
    setToastData
})=>{
    return (
        <div className={styles.Cnt}>
        <h3 className={styles.OptionHeading}>
            {sectionData.headingText}
        </h3>
        <div className={styles.OptionsOuterCnt}>
            {
                sectionData.options.map((optionData)=>{
                    const optionType  = optionData.optionType

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
                        key={optionData.key}
                        setShowPopupScreen={setShowPopupScreen}
                        settingsData={settingsData}
                        setSettingsData={setSettingsData}
                        setToastData={setToastData}

                    /> : null
                )

                })
            }
        </div>

    </div>
    )
}
const IgnoreSiteList = ({setClosePopup, settingsData, setSettingsData, setToastData})=>{
    const [recentSites, setRecentSites] = useState([])
    const [searchText, setSearchText] = useState('')
    
    const ignoreSites = settingsData['ignore-sites'] || []
    
    useEffect(()=>{
        getRecentHostnames().then((tempRecentSites)=>{
            setRecentSites(tempRecentSites)
        })
    }, [])

    let serachTextToValidHostName = null
    let isSearchTextValidSite = false
    if (isValidUrl(searchText)){
        serachTextToValidHostName = getHost(searchText)
        isSearchTextValidSite = serachTextToValidHostName && 
                !recentSites.includes(serachTextToValidHostName) && 
                !ignoreSites.includes(serachTextToValidHostName)
    }

    const recentSitesNotIgnoredSearchFiltered = recentSites.filter((hostname)=>{
        if (serachTextToValidHostName !== hostname){
            if (searchText && (hostname.search(searchText) < 0)){
                return false
            }
        }

        let isFound = false
        let indexOfIgnoreSites = 0

        while(!isFound && indexOfIgnoreSites < ignoreSites.length){
            isFound = ignoreSites.includes(hostname)
            indexOfIgnoreSites++
        }
        
        return !isFound
    })


    return (
    <div className={styles.IgnoreSiteList}
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
                    Ignore Sites
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
                            const newSettingData = await updateLocalSettingsData({
                                key: 'ignore-sites',
                                data: [...ignoreSites, serachTextToValidHostName],
                                optionalData: serachTextToValidHostName
                            })
                            setSettingsData(newSettingData)

                            setSearchText('')
                            setToastData(['The site is ignored', 'green'])
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
                    ignoreSites.length > 0 ?
                    ignoreSites.map((hostname)=>{
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
                                    const newSettingsData = await updateLocalSettingsData({
                                        key: 'ignore-sites',
                                        data:  ignoreSites.filter((site)=>site!=hostname),
                                        optionalData: hostname
                                    })
                                    setSettingsData(newSettingsData)

                                    setSearchText('')
                                    setToastData(['The site is removed', 'red'])

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
                                    <span className={styles.HostName}>
                                        {hostname}
                                    </span>    
                                </div>
                            </li>
                        )
                    }) : (
                        <li className={styles.NoSiteItem}>
                            No sites ignored
                        </li>
                    )
                }

                {
                    recentSitesNotIgnoredSearchFiltered.length > 0 ?
                    <li className={styles.HeaderCnt}>
                        <span className={styles.Icon}>
                            <GrCircleInformation />
                        </span>
                        <span className={styles.Header}>
                            Recent sites to ignore
                        </span>
                    </li> : null
                }
                {
                    recentSitesNotIgnoredSearchFiltered.length > 0 ?
                    recentSitesNotIgnoredSearchFiltered.map((hostname)=>{

                        return (
                            <li className={styles.SiteItem}
                                key={hostname}
                                title={hostname}
                                onClick={async () => {
                                    const newSettingsData = await updateLocalSettingsData({
                                        key: 'ignore-sites',
                                        data:  [...ignoreSites, hostname],
                                        optionalData: hostname
                                    })
                                    setSettingsData(newSettingsData)

                                    setSearchText('')
                                    setToastData(['The site is ignored', 'green'])

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


function AddOption({optionData, setShowPopupScreen, settingsData, setSettingsData, setToastData}){
    const bodyClickCount = useContext(BodyClickContext)
    const [optionActiveArr, setOptionActive] = useState(settingsData[optionData.key].map(s=>false))

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

    const addedItems = settingsData[optionData.key]



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
                        setShowPopupScreen(optionData.key)
                    }}
                
                >
                    Edit
                </button>
            </div>
        </div>
        <ul className={styles.AddOptionListCnt}>
            {   
                addedItems.length > 0 ? 
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
                                                setShowPopupScreen(optionData.key)
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
                    )
                }) : 
                <div className={styles.NoSites}>
                    No sites
                </div>
            }
        </ul>
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