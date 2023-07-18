import { getCookie } from '/js/cookie.js';

export function getInfo() {
    const code = getCookie('code');
    if (!code) window.location.href = '/getCode';

    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) window.location = '/';

    return { code, id };
}