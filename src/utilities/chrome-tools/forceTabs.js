// * Forces screen urls by tabId
export async function forceBlockedScreenByTabId(tabId) {
    chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL(`/src/pages/blocked-screen/blocked-screen.html`)
    });
}
export async function forceRestrictedScreenByTabId(tabId) {
    chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL(`/src/pages/restricted-screen/restricted-screen.html`)
    });
}
export async function forceTimeLimitScreenByTabId(tabId) {
    chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL(`/src/pages/time-limit-screen/time-limit-screen.html`)
    });
}
export async function createWelcomeScreencreenTab() {
    chrome.tabs.create({
        url: chrome.runtime.getURL(`/src/pages/welcome-screen/welcome-screen.html`)
    });
}
