import { handleBlockUnblockSite } from "../../localStorage/localSiteTagging"
import { getHost } from "../../utilities/simpleTools"

export async function handleContextMenuOnClick(info, tab){
    if (info.pageUrl){
      const hostname = getHost(info.pageUrl)
      handleBlockUnblockSite({
        hostname,
        shouldBlockSite: true,
      })
    }
  }