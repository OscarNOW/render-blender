import { onReload } from '/track/handler.js';
import { getInfo } from '/js/getInfo.js';

// const { code, id } = getInfo();
const { id } = getInfo();

document.title = `Done | ID ${id}`;

onReload(reload);

async function reload() {
    //todo: show video
    //todo: create download for video
}