import { onReload } from '/track/handler.js';
import { getInfo } from '/js/getInfo.js';

const { code, id } = getInfo();

document.title = `Render | ID ${id} | Frame ####`;

let frameElement = document.getElementById('frame');
const frameNumberElement = document.getElementById('frameNumber');

onReload(reload);

async function reload() {
    const frameNumber = await getFrameNumber();
    await reloadFrame(frameNumber);
    renderFrameNumber(frameNumber);
}

async function getFrameNumber() {
    const resp = await fetch(`/api/getLastRenderedFrameNumber?code=${code}&id=${id}`);
    if (resp.status === 404) return null;

    const frameNumber = await resp.text();

    return frameNumber;
}

function renderFrameNumber(frameNumber) {
    frameNumber ??= '####';

    frameNumberElement.innerText = frameNumber;
    document.title = `Render | ID ${id} | Frame ${frameNumber}`;
}

let lastFrameNumber;
async function reloadFrame(frameNumber) {
    if (frameNumber === lastFrameNumber) return;
    lastFrameNumber = frameNumber;

    if (!frameNumber) return;

    const resp = await fetch(`/api/getLastRenderedFrame?code=${code}&id=${id}`);
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