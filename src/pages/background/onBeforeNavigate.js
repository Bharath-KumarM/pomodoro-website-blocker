import { getLocalSettingsData } from "../../localStorage/localSettingsData"
import { getHost } from "../../utilities/simpleTools"
import { handleUrlUpdate } from "./helper"

export async function handleOnBeforeNavigate(details){
    const {tabId, url, frameType} = details

    const hostname = getHost(url)
    // const ignoreSites = settingsData['ignore-sites']
    const ignoreSites = await getLocalSettingsData({key: 'ignore-sites'})

    if (ignoreSites.includes(hostname)){
      return null
    }

    if (frameType === "outermost_frame"){
      handleUrlUpdate({tabId, url})
    }
  }