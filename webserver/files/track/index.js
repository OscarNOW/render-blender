import { getCookie } from '/js/cookie.js';
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

const code = getCookie('code');
if (!code) window.location.href = '/getCode';

const id = new URLSearchParams(window.location.search).get('id');
if (!id) window.location = '/';

document.title = `____ | ID ${id} | ____`;
await redirect();

async function redirect() {
    const resp = await fetch(`/api/getState?code=${code}&id=${id}`);
    if (resp.status === 403) {
        await wait(1000);
        await redirect();
        return;
    }

    const state = await resp.text();

    window.location.href = `/track/${state}?id=${id}`;
}