export const localLogMessage = async (msg)=>{
    let {logMassage} = await chrome.storage.local.get('logMassage')
    logMassage = logMassage ? logMassage : []
  
    const log = msg + ' ' + (new Date().toString().slice(0, 25))
    logMassage.push(log)
    chrome.storage.local.set({logMassage})
  }