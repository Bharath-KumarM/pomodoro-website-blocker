// Block sites Handles funciton
export async function handleUnblockSite({hostName, favIconUrl}){
    let {blockedSites} = await chrome.storage.local.get('blockedSites')
    if (!blockedSites) blockedSites = []
  
    let isHostRemoved = false
    const newBlockedSites = []
    for (const [blockedHostname, blockedFavIconUrl] of blockedSites){
      if (blockedHostname !== hostName) {
        newBlockedSites.push([blockedHostname, blockedFavIconUrl])
      }
      else isHostRemoved = true
    }
    if (isHostRemoved){
      await chrome.storage.local.set({blockedSites: [...newBlockedSites]})
    }
    return isHostRemoved
  }
  
export async function handleNewBlockSite({hostName, favIconUrl}){
    let {blockedSites} = await chrome.storage.local.get('blockedSites')
    if (!blockedSites) blockedSites = []
  
    let isHostFound = false
    for (const [blockedHostname, blockedFavIconUrl] of blockedSites){
      if (blockedHostname === hostName) {
        isHostFound = true
        break
      }
    }
    // Since Host is not found, add the new site to the list
    if (!isHostFound){
      blockedSites.push([hostName, favIconUrl])
      await chrome.storage.local.set({blockedSites: [...blockedSites]})
    }
    return !isHostFound
  }