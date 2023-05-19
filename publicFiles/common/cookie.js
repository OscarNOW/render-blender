export function getCookies() {
    return Object.fromEntries(
        document.cookie.split('; ').map((cookie) => [cookie.split('=')[0], cookie.split('=')[1]])
    );
}

export function getCookie(name) {
    return getCookies()[name] ?? null;
}

export function setCookie(name, value) {
    document.cookie = `${name}=${value}`;
}

export function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}