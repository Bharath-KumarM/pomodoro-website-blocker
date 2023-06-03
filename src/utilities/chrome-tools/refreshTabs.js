import { getLocalRestrictedSites } from "../../localStorage/localRestrictedSites";

// * Reloads/Refreshes screeen tabs
export async function refreshAllTabsByHostname(hostname) {

    // Refresh the tabs based on hostname
    const tabs = await chrome.tabs.query({ url: `*://${hostname}/*` });
    for (const { id } of tabs) {
        chrome.tabs.reload(id);
    }
}

export async function refreshAllBlockedScreenTabs() {
    const tabs = await chrome.tabs.query({ url: `chrome-extension://*/src/pages/blocked-screen/blocked-screen.html` });
    for (const tab of tabs) {
        chrome.tabs.reload(tab.id);
    }
}

export async function refreshAllRestrictedScreenTabs() {
    const tabs = await chrome.tabs.query({ url: `chrome-extension://*/src/pages/restricted-screen/restricted-screen.html` });
    for (const tab of tabs) {
        chrome.tabs.reload(tab.id);
    }
}

export async function refreshAllRestrictedSites(){
    let {restrictedSites} = await getLocalRestrictedSites()
  
    for (const hostname in restrictedSites){
      const tabs = await chrome.tabs.query({url: `*://${hostname}/*` })
      for (const {id} of tabs){
        chrome.tabs.reload(id)
      }
    }
  }


export async function refreshAllTimeLimitScreenTabs() {
    const timeLimitUrl = 'src/pages/time-limit-screen/time-limit-screen.html';
    const tabs = await chrome.tabs.query({ url: 'chrome-extension://*/' + timeLimitUrl });
    for (const { id } of tabs) {
        chrome.tabs.reload(id);
    }
}
