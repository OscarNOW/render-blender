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

let frameAmountWhenLoaded = null;
let firstFrameRenderTime = null;
let firstLoadFrameAmount = null;

let lastFrameRenderTime = null;
let lastRenderFrameAmount = null;

function calculateTimeLeft(frameAmount) {
    if (isNaN(frameAmount) || frameAmount === 0 || !frameAmount) return null;

    if (frameAmountWhenLoaded === null) { //todo-imp: test if this works
        frameAmountWhenLoaded = frameAmount;
        return null; // wait for a frame to render so whe now the exact time when it rendered
    }

    if (firstFrameRenderTime === null) {
        firstFrameRenderTime = performance.now();
        firstLoadFrameAmount = frameAmount;
    };

    if (lastRenderFrameAmount !== frameAmount) {
        lastRenderFrameAmount = frameAmount;
        lastFrameRenderTime = performance.now();
    };

    if (lastRenderFrameAmount - firstLoadFrameAmount < 1)
        return null; //can't calculate time, because don't know how long rendering a frame takes, because no frames have rendered while loaded

    const timePassed = lastFrameRenderTime - firstFrameRenderTime;
    const framesPassed = lastRenderFrameAmount - firstLoadFrameAmount;

    const timerPerFrame = timePassed / framesPassed;

    const framesLeft = lastFrameNumber - lastRenderFrameAmount;
    const timeLeft = (framesLeft * timerPerFrame) - (performance.now() - lastFrameRenderTime); //we subtract the time that has passed since the last frame was rendered

    return timeLeft;
}

function renderTimeLeft(timeLeft) {
    if (timeLeft === null) return;

    const minutesLeft = timeLeft / 1000 / 60;
    const secondsLeft = timeLeft / 1000 % 60;

    timeLeftElement.innerText = `${Math.round(minutesLeft)} minutes and ${Math.round(secondsLeft)} seconds`;
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