export async function handleMsgFromBlockSiteUI(blockSitesData, msg, sendResponse){
  const  {hostName, favIconUrl} = blockSitesData
  if (msg === 'newBlockSite') {
    let resolve
    const response = new Promise((res, rej)=>resolve=res)
    sendResponse(response)

    let {blockedSites} = await chrome.storage.local.get('blockedSites')
    if (!blockedSites) blockedSites = {}

    if (!blockedSites[hostName]){
      blockedSites[hostName] =  [favIconUrl]

      chrome.tabs.query({url: `*://${blockSitesData['hostName']}/*` }, function(tabs){
        for (const tab of tabs){
          chrome.tabs.reload(tab.id)
        }
      })

      await chrome.storage.local.set({'blockedSites': blockedSites})
      resolve(true)
    }
    resolve(false)
    return
  }
  if (msg === 'unBlockSite'){
    let resolve
    const response = new Promise((res, rej)=>resolve=res)
    sendResponse(response)

    let {blockedSites} = await chrome.storage.local.get('blockedSites')

    if (blockedSites && blockedSites[hostName]){
      // Removed
      delete blockedSites[hostName]
      const blockedScreenUrl = 'src/pages/blocked-screen/blocked-screen.html'
      chrome.tabs.query({url: 'chrome-extension://*/' + blockedScreenUrl }, 
        function(tabs){
          for (const tab of tabs){
            chrome.tabs.reload(tab.id)
          }
      })

      await chrome.storage.local.set({'blockedSites': blockedSites})
      resolve(false)
    }
    resolve(true)
    return
  }
}
