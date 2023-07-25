import { getCookie } from '/js/cookie.js';

export function getInfo({ requireId } = {}) {
    const code = getCookie('code');
    if (!code) window.location.href = '/getCode';

    if (!requireId) return { code };
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) window.location = '/';

    return { code, id };
}