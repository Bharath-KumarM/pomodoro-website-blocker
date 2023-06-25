import { getHost } from "./simpleTools"

export async function getNoOfVisitsByHostname  (hostname, startDate, endDate){
    if (!hostname) return 0

    let startDateObj = new Date()
    if (startDate){
        const [day, month, year] = startDate.split('-')
        startDateObj.setFullYear(year, month-1, day)
    }
    startDateObj.setHours(0, 0, 0, 0)

    let endDateObj = new Date()
    if (endDate){
        const [day, month, year] = endDate.split('-')
        endDateObj.setFullYear(year, month-1, day)
    }
    endDateObj.setHours(23, 59, 59)

    const history = await chrome.history.search({
        startTime: startDateObj.getTime(),
        endTime: endDateObj.getTime(),
        text: hostname
    })

    return history.length
}

export async function getNoOfVisitsObjByDateRage(startDate, endDate){
    let startDateObj = new Date() //Current time
    if (startDate){
        const [day, month, year] = startDate.split('-')
        startDateObj.setFullYear(year, month-1, day)
    }
    startDateObj.setHours(0, 0, 0, 0)

    let endDateObj = new Date() //Current time
    if (endDate){
        const [day, month, year] = endDate.split('-')
        endDateObj.setFullYear(year, month-1, day)
    }
    endDateObj.setHours(23, 59, 59)

    const history = await chrome.history.search({
        startTime: startDateObj.getTime(),
        endTime: endDateObj.getTime(),
        text: ''
    })

    const noOfVisitsObj = {}
    history.forEach(({url})=>{
        const hostname = getHost(url)
        if (noOfVisitsObj[hostname] === undefined) noOfVisitsObj[hostname] = 0
        noOfVisitsObj[hostname]++
    })

    return noOfVisitsObj
}
