import { setCookie } from '/js/cookie.js';

const path = document.getElementById('path');
const form = document.getElementById('form');
const code = document.getElementById('code');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setCookie('code', code.value);

    const url = new URL(form.action);

    url.searchParams.set('code', code.value);
    url.searchParams.set('filePath', path.value);

    const resp = await fetch(`/api/render?code=${code.value}&filePath=${path.value}`);
    const id = await resp.text();

    window.location.href = `/track?id=${id}`;

    return;
});