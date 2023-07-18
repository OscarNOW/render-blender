import { getCookie } from '/js/cookie.js';

const code = getCookie('code');
if (!code) window.location.href = '/getCode';

const id = new URLSearchParams(window.location.search).get('id');
if (!id) window.location = '/';

document.title = `____ | ID ${id} | ____`;

const resp = await fetch(`/api/getState?code=${code}&id=${id}`);
const state = await resp.text();

window.location.href = `/track/${state}?id=${id}`;