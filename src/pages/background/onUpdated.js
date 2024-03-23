import { getLocalFavIconUrlData, setLocalFavIconUrlData } from "../../localStorage/localFavIconUrlData"
import { getLocalSettingsData } from "../../localStorage/localSettingsData"
import { getHost } from "../../utilities/simpleTools"
import { handleAudibleUpdate, handleUrlUpdate, handleUrlUpdateForVisitCount } from "./helper"

export async function handleOnUpdated(tabId, updateInfo, tab){

   const  {audible} = updateInfo
   const {url, favIconUrl} = tab
   
   if (url && url.startsWith('http')){
      
      const localFavIconUrlData = await getLocalFavIconUrlData()

      const hostname = getHost(url)
     
      if (localFavIconUrlData[hostname] === undefined){
        localFavIconUrlData[hostname] = favIconUrl
        await setLocalFavIconUrlData(localFavIconUrlData)
      }
      
      const ignoreSites = await getLocalSettingsData({key: 'ignore-sites'})

      if (ignoreSites.includes(hostname)){
        return null
      }
      
      if (audible !== undefined){
        const shouldCountScreenTimeBgAudio = await getLocalSettingsData({key: 'should-count-screen-time-bg-audio'})
        if (shouldCountScreenTimeBgAudio){
          handleAudibleUpdate({tabId, url: tab.url, audible})
        }
      }

      handleUrlUpdateForVisitCount({tabId, url})
      handleUrlUpdate({tabId, url})
    }
  }