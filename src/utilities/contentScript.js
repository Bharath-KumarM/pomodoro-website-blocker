import { getLocalSettingsData } from "../localStorage/localSettingsData"
import contentScript from '../pages/content/content?script'


export async function registerContentScripts(){
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
    
    return true
}

export async function getRegisteredContentScripts(){
    return await chrome.scripting.getRegisteredContentScripts({
      ids: ["session-script"]
    })
    
}

