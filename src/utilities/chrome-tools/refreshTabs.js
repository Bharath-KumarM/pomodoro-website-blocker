import { getRestrictedSites } from "../../localStorage/localSiteTagging";

// * Reloads/Refreshes screeen tabs
export async function refreshAllTabsByHostname(hostname) {

    // Refresh the tabs based on hostname
    const tabs = await chrome.tabs.query({ url: `*://${hostname}/*` });

    const tabReloadPromiseArr = []
    for (const { id } of tabs) {
        const promise = chrome.tabs.reload(id);
        tabReloadPromiseArr.push(promise)
    }

    await Promise.all(tabReloadPromiseArr)
    return true
}

export async function refreshAllBlockedScreenTabs() {
    const tabs = await chrome.tabs.query({ url: `chrome-extension://*/src/pages/blocked-screen/blocked-screen.html` });
    
    const tabReloadPromiseArr = []
    for (const tab of tabs) {
        const promise = chrome.tabs.reload(tab.id);
        tabReloadPromiseArr.push(promise)

    }

    await Promise.all(tabReloadPromiseArr)
    return true
}

export async function refreshAllRestrictedScreenTabs() {
    const tabs = await chrome.tabs.query({ url: `chrome-extension://*/src/pages/restricted-screen/restricted-screen.html` });
    
    const tabReloadPromiseArr = []
    for (const tab of tabs) {
        const promise = chrome.tabs.reload(tab.id);
        tabReloadPromiseArr.push(promise)
    }

    await Promise.all(tabReloadPromiseArr)
    return true
}

export async function refreshAllRestrictedSites(){
    let restrictedSites = await getRestrictedSites()
    const tabReloadPromiseArr = []
  
    for (const hostname of restrictedSites){
      const tabs = await chrome.tabs.query({url: `*://${hostname}/*` })
      for (const {id} of tabs){
        const promise = chrome.tabs.reload(id)
        tabReloadPromiseArr.push(promise)

      }
    }

    await Promise.all(tabReloadPromiseArr)
    return true
  }


export async function refreshAllTimeLimitScreenTabs() {
    const timeLimitUrl = 'src/pages/time-limit-screen/time-limit-screen.html';
    const tabs = await chrome.tabs.query({ url: 'chrome-extension://*/' + timeLimitUrl });

    const tabReloadPromiseArr = []
    for (const { id } of tabs) {
        const promise = chrome.tabs.reload(id);
        tabReloadPromiseArr.push(promise)

    }

    await Promise.all(tabReloadPromiseArr)
    return true
}
