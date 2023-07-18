import { onReload } from '/track/handler.js';
import { getInfo } from '/js/getInfo.js';

const videoElement = document.getElementById('video');

const { code, id } = getInfo();

document.title = `Done | ID ${id}`;

onReload(reload);

let loadedVideo = false;
async function reload() {
    if (loadedVideo) return;
    loadedVideo = true;

    await loadVideo();
}

async function loadVideo() {
    const resp = await fetch(`/api/getVideo?code=${code}&id=${id}`);
    const video = await resp.blob();
    const videoUrl = URL.createObjectURL(video);

    videoElement.src = videoUrl;
};