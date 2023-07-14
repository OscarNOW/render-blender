import { getCookie } from '/js/cookie.js';

const id = new URLSearchParams(window.location.search).get('id');

if (!id) window.location = '/';
if (!getCookie('code')) window.location = '/';

const imageElement = document.getElementById('image');
const frameNumberElement = document.getElementById('frameNumber');

document.title = `Track ${id}`;

setInterval(reload, 1000);

async function reload() {
    await Promise.all([
        reloadFrameNumber(),
        reloadImage()
    ]);
}

async function reloadFrameNumber() {
    const resp = await fetch(`/api/getFrameNumber?code=${getCookie('code')}&id=${id}`);
    const frameNumber = await resp.text();

    frameNumberElement.innerText = frameNumber;
}

async function reloadImage() {
    const resp = await fetch(`/api/getLastFrame?code=${getCookie('code')}&id=${id}`);
    const image = await resp.blob();
    const imageUrl = URL.createObjectURL(image);

    imageElement.src = imageUrl;
}