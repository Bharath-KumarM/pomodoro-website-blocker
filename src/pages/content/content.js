console.log('I am content script 4')
checkAndBlockSite()



async function checkAndBlockSite(){
    let {blockedSites} = await chrome.storage.local.get('blockedSites')
    console.log(blockedSites) //Debug
    if (!blockedSites) return 

    const hostname = new URL(location).hostname;
    console.log(location)
    let isBlockSiteFound = false
    for (const [blockSite, favIconURL] of blockedSites){

        if (blockSite === hostname) {
            isBlockSiteFound = true
            break
        }
    }
    if (!isBlockSiteFound) return
    window.stop()
    document.getElementsByTagName('body')[0].remove()

}

chrome.runtime.onMessage.addListener(({msg}) => {
    if (msg == 'block'){
        document.getElementsByTagName('body')[0].remove()
    }
    if (msg == 'unblock'){
        location.reload()
    }
    
  });


