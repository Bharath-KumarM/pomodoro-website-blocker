
export function getDateString (n){ 
    if (!n) n=0
    const askedDate = new Date(Date.now() + (n*864e5)); // 864e5 == 86400000 == 24*60*60*1000
    const year = askedDate.toLocaleString("default", { year: "numeric" });
    const month = askedDate.toLocaleString("default", { month: "2-digit" });
    const day = askedDate.toLocaleString("default", { day: "2-digit" });

    return `${day}-${month}-${year}`
}

export function getCurrentTime () {
    const currDate = new Date()
    const hour = currDate.toLocaleString("default", { hour: "2-digit" }).split(" ")[0];
    const noon = currDate.toLocaleString("default", { hour: "2-digit" }).split(" ")[1];
    const minute = currDate.toLocaleString("default", { minute: "2-digit" });

    return `${noon}:${hour}:${minute}`
}