import { getCookie } from '/js/cookie.js';

const id = new URLSearchParams(window.location.search).get('id');

if (!id) window.location = '/';
if (!getCookie('code')) window.location = '/';

let frameElement = document.getElementById('frame');
const frameNumberElement = document.getElementById('frameNumber');

document.title = `Track ID ${id}: Frame ###`;

setInterval(reload, 1000);

async function reload() {
    const frameNumber = await getFrameNumber();
    await reloadFrame(frameNumber);
    renderFrameNumber(frameNumber);
}

async function getFrameNumber() {
    const resp = await fetch(`/api/getLastFrameNumber?code=${getCookie('code')}&id=${id}`);
    if (resp.status === 404) return null;

    const frameNumber = await resp.text();

    return frameNumber;
}

function renderFrameNumber(frameNumber) {
    frameNumberElement.innerText = frameNumber ?? '???';
    document.title = `Track ID ${id}: Frame ${frameNumber ?? '???'}`;
}

let lastFrameNumber;
async function reloadFrame(frameNumber) {
    if (frameNumber === lastFrameNumber) return;
    lastFrameNumber = frameNumber;

    if (!frameNumber) return;

    //todo: doesn't load full image all of the time
    const resp = await fetch(`/api/getLastFrame?code=${getCookie('code')}&id=${id}`);
    const image = await resp.blob();
    const imageUrl = URL.createObjectURL(image);

    const newFrameElement = await createImageElement(imageUrl);
    newFrameElement.id = 'frame';

    frameElement.remove();
    newFrameElement.style.display = null;

    frameElement = newFrameElement;
}

function createImageElement(src) {
    return new Promise((res) => {
        const image = document.createElement('img');
        image.src = src;
        image.style.display = 'none';
        document.body.appendChild(image);

        image.addEventListener('load', () => {
            res(image);
        });
    });
}