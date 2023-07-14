import { getCookie } from '/js/cookie.js';

const id = new URLSearchParams(window.location.search).get('id');

if (!id) window.location = '/';
if (!getCookie('code')) window.location = '/';

const imageElement = document.getElementById('image');
const frameNumberElement = document.getElementById('frameNumber');

document.title = `Track ${id}`;

setInterval(reload, 1000);

async function reload() {
    const frameNumber = await getFrameNumber();
    await reloadImage(frameNumber);
    renderFrameNumber(frameNumber);
}

async function getFrameNumber() {
    const resp = await fetch(`/api/getLastFrameNumber?code=${getCookie('code')}&id=${id}`);
    const frameNumber = await resp.text();

    return frameNumber;
}

function renderFrameNumber(frameNumber) {
    frameNumberElement.innerText = frameNumber;
}

let lastFrameNumber;
async function reloadImage(frameNumber) {
    if (frameNumber === lastFrameNumber) return;
    lastFrameNumber = frameNumber;

    const resp = await fetch(`/api/getLastFrame?code=${getCookie('code')}&id=${id}`);
    const image = await resp.blob();
    const imageUrl = URL.createObjectURL(image);

    imageElement.src = imageUrl;
}