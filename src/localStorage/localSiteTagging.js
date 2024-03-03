import { checkScreenTimeSurpassedLimit } from "../utilities/chrome-tools/chromeApiTools"
import { refreshAllBlockedScreenTabs, refreshAllRestrictedScreenTabs, refreshAllTabsByHostname } from "../utilities/chrome-tools/refreshTabs"
import { checkFocusScheduleActive } from "../utilities/focusModeHelper"
import { isValidUrl } from "../utilities/simpleTools"
import { checkFocusModeTracker, getLocalFocusModeTracker } from "./localFocusModeTracker"


export async function getLocalSiteTagging(){
    const {siteTagging} = await chrome.storage.local.get('siteTagging') || {siteTagging: {}}
    return siteTagging
}

export async function setLocalSiteTagging(siteTagging){
    await chrome.storage.local.set({siteTagging})
}

export async function updateLocalSiteTagging({
    hostname='',
    shouldBlockSite=null,
    shouldRestrictSite=null,
    shouldAddTimeLimit=null,
    timeLimitData=null
}){
    if (hostname === '') {
        return {errorMeesage: 'hostname is invalid'}
    }

    if (isValidUrl(hostname) === false){
        return {errorMeesage: 'Invalid hostname'}
    }

    const response = {}
    const siteTagging = await getLocalSiteTagging()
    let siteTaggingDataArr
    let shouldRefreshAllTabsWithHostname = false

    // Initializing
    if (siteTagging[hostname] === undefined){
        siteTaggingDataArr = Array(3).fill(null)
    } else{
        siteTaggingDataArr = siteTagging[hostname]
    }

    const [
        existingIsBlocked,
        existingIsRestricted,
        existingTimeLimitData
    ] = siteTaggingDataArr


    if (shouldBlockSite !== null){
        if (existingIsBlocked === shouldBlockSite){
            response.isSiteBlocked = null
            if (shouldBlockSite === true){
                response.errorMeesage = 'Already blocked'
            } else{
                response.errorMeesage = 'Already unblocked'
            }
        } else{
            siteTaggingDataArr[0] = shouldBlockSite
            response.isSiteBlocked = shouldBlockSite
            if (shouldBlockSite === true){
                shouldRefreshAllTabsWithHostname = true
            } else if(shouldBlockSite === false){
                await refreshAllBlockedScreenTabs()
            }
        }
    }


    if (shouldRestrictSite !== null){
        if (existingIsRestricted === shouldRestrictSite){
            response.isSiteRestricted = null
            if (shouldRestrictSite === true){
                response.errorMeesage = 'Already restricted'
            } else{
                response.errorMeesage = 'Already unrestricted'
            }
        } else{
            siteTaggingDataArr[1] = shouldRestrictSite
            response.isSiteRestricted = shouldRestrictSite

            if (shouldRestrictSite === true){
                const isFocusModeOn = await checkFocusModeTracker()
                const isCurrTimeFocusScheduled = await checkFocusScheduleActive()

                shouldRefreshAllTabsWithHostname = isFocusModeOn || isCurrTimeFocusScheduled

            } else if(shouldRestrictSite === false){
                await refreshAllRestrictedScreenTabs()
            }
        }
    }



    if (shouldAddTimeLimit !== null){

        switch (true){
            case shouldAddTimeLimit === true && timeLimitData === null:
                response.errorMeesage = 'Time limit data invalid'
                break
            case shouldAddTimeLimit == false && !existingTimeLimitData:
                response.errorMeesage = 'Time limit doesn\'t exist'
                break
            default:
                siteTaggingDataArr[2] = timeLimitData
                response.isTimeLimited = shouldAddTimeLimit
    
                shouldRefreshAllTabsWithHostname =  shouldAddTimeLimit && await checkScreenTimeSurpassedLimit(hostname)
                break    
        }
    }

    siteTagging[hostname] = siteTaggingDataArr
    await setLocalSiteTagging(siteTagging)

    const isAllTabsRefreshed = shouldRefreshAllTabsWithHostname && await refreshAllTabsByHostname(hostname)


    return response
}

export async function getBlockedSites(){
    const blockedSites = []
    const siteTagging = await getLocalSiteTagging()

    for (const site of Object.keys(siteTagging)){
        const [isBlocked, isRestricted, timeLimitData] = siteTagging[site] 
        if (isBlocked === true){
            blockedSites.push(site)
        }
    }

    return blockedSites
}
export async function getRestrictedSites(){
    const restrictedSite = []
    const siteTagging = await getLocalSiteTagging()

    for (const site of Object.keys(siteTagging)){
        const [isBlocked, isRestricted, timeLimitData] = siteTagging[site] 
        if (isRestricted === true){
            restrictedSite.push(site)
        }
    }

    return restrictedSite
}
export async function getScreenTimeLimit(hostname=null){
    const screenTimeLimit = {}
    const siteTagging = await getLocalSiteTagging()

    let singleSiteTimeLimitData = null

    for (const site of Object.keys(siteTagging)){
        const [isBlocked, isRestricted, timeLimitData] = siteTagging[site] 
        if (hostname){
            if (hostname === site && timeLimitData){
                singleSiteTimeLimitData = timeLimitData
                break
            }
        } else {
            if (timeLimitData){
                screenTimeLimit[site] = timeLimitData
            }
        }
    }

    if (hostname){
        return singleSiteTimeLimitData
    } else {
        return screenTimeLimit
    }

}
export async function checkRestrictedSites(hostname){
    const restrictedSite = await getRestrictedSites()
    return restrictedSite.includes(hostname)
}
export async function getTimelimitedSites(){
    const timeLimitedSites = []
    const siteTagging = await getLocalSiteTagging()

    for (const site of Object.keys(siteTagging)){
        const [isBlocked, isRestricted, timeLimitData] = siteTagging[site] 
        if (timeLimitData){
            timeLimitedSites.push(site)
        }
    }

    return timeLimitedSites
}

export async function checkSiteTagging({
    hostname='',
    checkBlockedSite=false,
    checkRestrictedSite=false,
    checkTimeLimitedSite=false,
    getTimeLimitedData=false
 }){
    if (hostname === '') {
        return false
    }

    const siteTagging = await getLocalSiteTagging()

    if (siteTagging[hostname] === undefined){
        return false
    }

    const [isBlocked, isRestricted, timeLimitData] = siteTagging[hostname] 

    if (checkBlockedSite){
        return isBlocked
    }
    if (checkRestrictedSite){
        return isRestricted
    }
    if (checkTimeLimitedSite){
        return Boolean(timeLimitData)
    }
    if (getTimeLimitedData){
        return timeLimitData
    }
}

export async function handleBlockUnblockSite({hostname, shouldBlockSite, setToastData=null}){
    
    let toastData = null
    const response = await updateLocalSiteTagging({hostname, shouldBlockSite})
    let isRequestSuccessful = false

    switch (true){
        case Boolean(response.errorMeesage):
            toastData = [response.errorMeesage, 'red']
            break
        case shouldBlockSite === response.isSiteBlocked:
            toastData = [
                `The site is ${shouldBlockSite ? 'blocked' : 'unblocked'}`, 
                'green'
            ]
            isRequestSuccessful = true
            break
        default:
            toastData = ['Blocked site is invalid', 'red']
            break
    }

    setToastData && toastData && setToastData(toastData)

    return isRequestSuccessful
}


export async function handleRestrictUnRestrictSite({hostname, shouldRestrictSite, setToastData=null}){
    
    let toastData = null
    const response = await updateLocalSiteTagging({hostname, shouldRestrictSite})
    let isRequestSuccessful = false

    switch (true){
        case Boolean(response.errorMeesage):
            toastData = [response.errorMeesage, 'red']
            break
        case shouldRestrictSite === response.isSiteRestricted:
            toastData = [
                `The site is ${shouldRestrictSite ? 'restricted' : 'unrestricted'}`, 
                'green'
            ]
            isRequestSuccessful = true
            break
        default:
            toastData = ['Distracted site is added', 'red']
            break
    }

    setToastData && toastData && setToastData(toastData)


    return isRequestSuccessful
}

export async function handleScreenTimeLimtUpdate({
    hostname='',
    timeLimitData=null,
    shouldAddTimeLimit=null,
    setToastData=null
}){
    let toastData = null
    const response = await updateLocalSiteTagging({
        hostname,
        shouldAddTimeLimit,
        timeLimitData,
    })

    let isRequestSuccessful = false

    switch (true){
        case Boolean(response.errorMeesage):
            toastData = [response.errorMeesage, 'red']
            break
        case shouldAddTimeLimit === response.isTimeLimited:
            toastData = [
                shouldAddTimeLimit ? 'Time Limit set' : 'Time limit removed' , 
                'green'
            ]
            isRequestSuccessful = true
            break
        default:
            toastData = ['Time limit is invalid', 'red']
            break
    }


    setToastData && toastData && setToastData(toastData)

    return isRequestSuccessful

}
