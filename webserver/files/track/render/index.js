import { onReload } from '/track/handler.js';
import { getInfo } from '/js/getInfo.js';

const { code, id } = getInfo();
document.title = `Frame #/#### | Render | ID ${id}`;

const lastFrameNumber = await getLastFrameNumber();
document.title = `Frame #/${lastFrameNumber} | Render | ID ${id}`;

let frameElement = document.getElementById('frame');
const frameNumberElement = document.getElementById('frameNumber');
const progressElement = document.getElementById('progress');

const timeLeftElement = document.getElementById('timeLeft');

onReload(reload);

async function reload() {
    const frameNumber = await getLastRenderedFrameNumber();
    await reloadFrame(frameNumber);
    renderFrameNumber(frameNumber);

    const timeLeft = calculateTimeLeft(frameNumber);
    renderTimeLeft(timeLeft);
}

let firstFrameLoadTime = null;
let firstLoadFrameAmount = null;
function calculateTimeLeft(frameNumber) {
    if (firstFrameLoadTime === null) {
        firstFrameLoadTime = performance.now();
        firstLoadFrameAmount = frameNumber;
    };

    const timePassed = performance.now() - firstFrameLoadTime;
    const framesPassed = frameNumber - firstLoadFrameAmount;

    const timerPerFrame = timePassed / framesPassed;

    const framesLeft = lastFrameNumber - frameNumber;
    const timeLeft = framesLeft * timerPerFrame;

    return timeLeft;
}

function renderTimeLeft(timeLeft) {
    const minutesLeft = timeLeft / 1000 / 60;
    timeLeftElement.innerText = `${Math.round(minutesLeft)} minutes`;
}

async function getLastFrameNumber() {
    const resp = await fetch(`/api/getLastFrameNumber?code=${code}&id=${id}`);
    const frameNumber = await resp.text();

    return frameNumber;
}

async function getLastRenderedFrameNumber() {
    const resp = await fetch(`/api/getLastRenderedFrameNumber?code=${code}&id=${id}`);
    if (resp.status === 404) return 0;

    const frameNumber = await resp.text();
    const intFrameNumber = isNaN(parseInt(frameNumber)) ? frameNumber : parseInt(frameNumber);

    return intFrameNumber;
}

function renderFrameNumber(orgFrameNumber) {
    const frameNumber = orgFrameNumber ?? '#';

    frameNumberElement.innerText = `${frameNumber}/${lastFrameNumber}`;
    document.title = `Frame ${frameNumber}/${lastFrameNumber} | Render | ID ${id}`;
    progressElement.style.setProperty('--progress', `${((orgFrameNumber ?? 0) / lastFrameNumber) * 100}%`);
}

let lastRenderedFrameNumber;
async function reloadFrame(frameNumber) {
    if (frameNumber === lastRenderedFrameNumber) return;
    lastRenderedFrameNumber = frameNumber;

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