import { onReload } from '/track/handler.js';
import { getInfo } from '/js/getInfo.js';

const { code, id } = getInfo();
document.title = `Done | ID ${id}`;

const deleteButton = document.getElementById('deleteButton');
deleteButton.addEventListener('click', async () => {
    deleteButton.disabled = true;
    deleteButton.style.cursor = 'wait';

    await fetch(`/api/delete?code=${code}&id=${id}`);

    deleteButton.disabled = false;
    deleteButton.style.cursor = null;
});
deleteButton.disabled = false;
deleteButton.style.cursor = null;

const videoElement = document.getElementById('video');
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