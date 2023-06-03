export const localLogMessage = async (msg)=>{
    const MAX_LEN = 100

    let {logMassage} = await chrome.storage.local.get('logMassage')
    logMassage = logMassage ? logMassage : []

    logMassage.slice(Math.max(logMassage.length - MAX_LEN, 0))

    const log = msg + ' ' + (new Date().toString().slice(0, 25))
    logMassage.push(log)
    chrome.storage.local.set({logMassage})
  }