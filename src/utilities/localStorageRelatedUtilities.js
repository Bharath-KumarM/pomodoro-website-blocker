import { getLocalScreenTimeTracker, setLocalScreenTimeTracker } from "../localStorage/localScreenTimeTracker"
import { getLocalSiteTagging, setLocalSiteTagging } from "../localStorage/localSiteTagging"
import { getLocalVisitTracker, setLocalVisitTracker } from "../localStorage/localVisitTracker"

export async function checkHostnameArrReference(hostnameArr) {
    const siteTagging = await getLocalSiteTagging()
    const ReferencedArr = []
    for (const hostname of hostnameArr){
        ReferencedArr.push(Boolean(siteTagging[hostname]))
    }


    const screenTimeTracker = await getLocalScreenTimeTracker()

    for (const [index, hostname] of hostnameArr.entries()){
        if (ReferencedArr[index]) {
            continue
        }       

        for (const date in screenTimeTracker){
            if (screenTimeTracker[date][hostname]){
                ReferencedArr[index] = true
                break
            }
        }
    }
    const visitTracker = await getLocalVisitTracker()
    for (const [index, hostname] of hostnameArr.entries()){
        if (ReferencedArr[index]) {
            continue
        }       

        for (const date in visitTracker){
            if (visitTracker[date][hostname]){
                ReferencedArr[index] = true
                break
            }
        }
    }

    return ReferencedArr
} 


export async function delHostnameReference(hostname) {

    let isDeleted = false
    const siteTagging = await getLocalSiteTagging()
    delete siteTagging[hostname]

    setLocalSiteTagging(siteTagging)

    const screenTimeTracker = await getLocalScreenTimeTracker()
    for (const date in screenTimeTracker){
        if (screenTimeTracker[date][hostname]){
            isDeleted = true
            delete screenTimeTracker[date][hostname]
        }
    }
    await setLocalScreenTimeTracker(screenTimeTracker)

    const visitTracker = await getLocalVisitTracker()
    for (const date in visitTracker){
        if (visitTracker[date][hostname]){
            isDeleted = true
            delete visitTracker[date][hostname]
        }
    }
    await setLocalVisitTracker(visitTracker)

    return isDeleted


} 