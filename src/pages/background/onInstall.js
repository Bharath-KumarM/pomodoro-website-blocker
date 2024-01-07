
import { getLocalScreenTimeTracker, setLocalScreenTimeTracker } from "../../localStorage/localScreenTimeTracker"
import { getLocalSiteTagging, setLocalSiteTagging } from "../../localStorage/localSiteTagging"
import { turnOffLocalTakeABreakTrackerforRestrict } from "../../localStorage/localTakeABreakTrackerforRestrict"
import { getLocalVisitTracker, setLocalVisitTracker } from "../../localStorage/localVisitTracker"
import { createPopupScreenTab, createWelcomeScreenTab } from "../../utilities/chrome-tools/forceTabs"
import { registerContentScripts } from "../../utilities/contentScript"
import { getDateString } from "./helper"

export async function handleOnInstall ({id, previousVersion, reason}){
    // reason = 'install' || 'update' || 'chrome_update' || 'shared_module_update'

    console.log(`OnInstallEvent, reason: ${reason} at ${Date().toLocaleString()}`)

    chrome.contextMenus.removeAll(()=>{
      chrome.contextMenus.create({
        documentUrlPatterns: ["https://*/*"],
        id: 'be-focused-block',
        type: 'normal',
        title: 'Block current site'
      })
    })

    await registerContentScripts()

    
    turnOffLocalTakeABreakTrackerforRestrict({isForceTurnOff: true, shouldRefreshSites: false})
    
    if (['install', 'update', 'shared_module_update', 'chrome_update'].includes(reason)){
      //* For debug only
      updateDailyLocalStorageBackup()
      createPopupScreenTab()
    }
    
    if (reason === 'install'){
      
      await createWelcomeScreenTab()
    }

  }

//* For debug only
export async function updateDailyLocalStorageBackup(){
  let { dailyLocalStorageBackup } = await chrome.storage.local.get('dailyLocalStorageBackup')
  dailyLocalStorageBackup = dailyLocalStorageBackup ?? {}

  const currDate = getDateString()
  if (dailyLocalStorageBackup[currDate] !== undefined){
      console.log({dailyLocalStorageBackup})
      return false
  }

  const siteTagging = await getLocalSiteTagging()
  const screenTimeTracker = await getLocalScreenTimeTracker()
  const visitTracker = await getLocalVisitTracker()

  dailyLocalStorageBackup[currDate] = {
      siteTagging,
      screenTimeTracker,
      visitTracker
  }

  await chrome.storage.local.set({dailyLocalStorageBackup})
  console.log({dailyLocalStorageBackup})
  return true
}

export async function restoreLocalStorageBackup({date='24-11-2023'}){
    
  let { dailyLocalStorageBackup } = await chrome.storage.local.get('dailyLocalStorageBackup')
  const {
      siteTagging,
      screenTimeTracker,
      visitTracker
  } = dailyLocalStorageBackup[date]

  await setLocalSiteTagging(siteTagging)
  await setLocalScreenTimeTracker(screenTimeTracker)
  await setLocalVisitTracker(visitTracker)

  console.log('successfully restored local storage backup')
}
