export function setCookie(name, value = '') {
    document.cookie = `${name}=${value}; path=/`;
}

export function getCookie(name) {
    name = `${name}=`;
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
        cookie = cookie.trimStart();

        if (cookie.indexOf(name) === 0)
            return cookie.substring(name.length, cookie.length);
    }

    return null;
};

export function deleteCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}