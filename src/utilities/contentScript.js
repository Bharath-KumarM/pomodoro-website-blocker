import { getLocalSettingsData } from "../localStorage/localSettingsData"
import contentScript from '../pages/content/content?script'


export async function registerContentScripts(){
    const contentScripts = await chrome.scripting.getRegisteredContentScripts({
      ids: ["session-script"]
    })

    if (contentScripts.length > 0){
      return true
    }

    const ignoreSites = await getLocalSettingsData({
        key: 'ignore-sites'
    })

    const excludeMatches = ignoreSites.map((sites) => {
        return `*://${sites}/*`
    })

    await chrome.scripting.registerContentScripts([{
        id: "session-script",
        js: [contentScript],
        matches: ["*://*/*"],
        runAt: "document_start",
        excludeMatches
      }])
  
  }


export async function updateContentScripts(){

    const ignoreSites = await getLocalSettingsData({
        key: 'ignore-sites'
    })

    const excludeMatches = ignoreSites.map((sites) => {
        return `*://${sites}/*`
    })

    const registeredContentScripts = await chrome.scripting.getRegisteredContentScripts()
    console.log({registeredContentScripts})

    try {
      await chrome.scripting.updateContentScripts(
          [{
            id: "session-script",
            js: [contentScript],
            matches: ["*://*/*"],
            excludeMatches,
          //   excludeMatches: ["*://www.google.com/*", "*://www.youtube.com/*"],
            runAt: "document_start",
          }]
        )
    } catch {
      registerContentScripts()
    }
    
    return true
}

export async function getRegisteredContentScripts(){
    return await chrome.scripting.getRegisteredContentScripts({
      ids: ["session-script"]
    })
    
}

