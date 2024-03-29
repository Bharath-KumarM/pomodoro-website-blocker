export function getAverageRGB(imgEl) {

    var blockSize = 5, // only visit every 5 pixels
        defaultRGB = {r:0,g:0,b:0}, // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = {r:0,g:0,b:0},
        count = 0;

    if (!context) {
        return defaultRGB;
    }

    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

    context.drawImage(imgEl, 0, 0);

    try {
        data = context.getImageData(0, 0, width, height);
    } catch(e) {
        /* security error, img on diff domain */
        return defaultRGB;
    }

    length = data.data.length;

    while ( (i += blockSize * 4) < length ) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i+1];
        rgb.b += data.data[i+2];
    }

    // ~~ used to floor values
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);

    return rgb;

}
export function pad2(number) {
    return (number < 10 ? '0' : '') + number
}

export function isValidUrl(urlString){
    let tempUrl = urlString
    if (!urlString.startsWith('http')){
        tempUrl = 'https://' + urlString
    }

    try{
        new URL(tempUrl)
        return true
    } catch(error){
        return false
    }
}

export function getHost(url){
    if (!isValidUrl(url)){
        return ''
    }
    let tempUrl = url
    if (!url.startsWith('http')){
        tempUrl = 'https://' + url
    }
    return (new URL(tempUrl)).hostname
}

export function getFavIconUrlFromGoogleApi(hostname){
    return `http://www.google.com/s2/favicons?domain=${hostname}&sz=${128}`
}
