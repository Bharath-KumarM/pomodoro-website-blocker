
export function getDateString (n){ 
    if (!n) n=0
    const askedDate = new Date(Date.now() + (n*864e5)); // 864e5 == 86400000 == 24*60*60*1000
    const year = askedDate.toLocaleString("default", { year: "numeric" });
    const month = askedDate.toLocaleString("default", { month: "2-digit" });
    const day = askedDate.toLocaleString("default", { day: "2-digit" });
    
    return `${day}-${month}-${year}`
}

export function getDayString (n){
    if (!n) n=0
    const askedDate = new Date(Date.now() + (n*864e5)); // 864e5 == 86400000 == 24*60*60*1000
    return askedDate.toLocaleString(window.navigator.language, {weekday: 'short'});
}
export function getDayNumber (n){
    const dayString = getDayString(n)
    if (dayString === 'Sun') return 0
    if (dayString === 'Mon') return 1
    if (dayString === 'Tue') return 2
    if (dayString === 'Wed') return 3
    if (dayString === 'Thu') return 4
    if (dayString === 'Fri') return 5
    if (dayString === 'Sat') return 6
}

export function getFullDate(n){
    if (!n) n=0
    const askedDate = new Date(Date.now() + (n*864e5)); // 864e5 == 86400000 == 24*60*60*1000
    
    const dayString = getDayString(n) //Sun
    const day = askedDate.toLocaleString("default", { day: "numeric" }); //4 or 24
    const month = askedDate.toLocaleString("default", { month: 'short' }); //Mar

    return `${dayString}, ${day} ${month}`
}

export function getCurrentTime () {
    const currDate = new Date()
    const hour = currDate.toLocaleString("default", { hour: "2-digit" }).split(" ")[0];
    const noon = currDate.toLocaleString("default", { hour: "2-digit" }).split(" ")[1];
    const minute = currDate.toLocaleString("default", { minute: "2-digit" });

    return `${noon}:${hour}:${minute}`
}

export function getHrMinString(seconds){
    let time = ''

    const hr = parseInt(seconds/60) 
    const min = seconds%60
    if (hr){
        time += (hr + (hr === 1 ? ' hr': ' hrs'))
    }

    if(min){
        if (hr) time += (', ')
        else time += ''

        if (hr) time += ((min) + ' mins')
        else time += ((min) + ' minutes')
    }

    return time

}