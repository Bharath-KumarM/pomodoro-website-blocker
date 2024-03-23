

export const getLocalFavIconUrlData = async ()=>{
    let {localFavIconUrlData} = await chrome.storage.local.get('localFavIconUrlData')

    if (localFavIconUrlData === undefined){
        localFavIconUrlData = {}
    }

    return localFavIconUrlData
}

export const setLocalFavIconUrlData = async (localFavIconUrlData)=>{
    return await chrome.storage.local.set({localFavIconUrlData})
}