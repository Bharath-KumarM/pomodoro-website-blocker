

export async function turnOnFocusMode(){
  chrome.storage.local.set({focusModeTracker: true})
  await refreshRestrictedSites()
  return true
}
export async function turnOffFocusMode(){
  chrome.storage.local.set({focusModeTracker: false})
  await refreshRestrictedScreenSites()
  return true
}
export async function refreshRestrictedSites(){
  let {restrictedSites} = await chrome.storage.local.get('restrictedSites')
  if (!restrictedSites) return false

  for (const hostname in restrictedSites){
    const tabs = await chrome.tabs.query({url: `*://${hostname}/*` })
    for (const {id} of tabs){
      chrome.tabs.reload(id)
    }
  }
}

export async function refreshRestrictedScreenSites(){
  const restrictedScreenUrl = 'src/pages/restricted-screen/restricted-screen.html'
  const tabs = await chrome.tabs.query({url: 'chrome-extension://*/' + restrictedScreenUrl }) 
  console.log(tabs)
  for (const {id} of tabs){
    chrome.tabs.reload(id)
  }
}