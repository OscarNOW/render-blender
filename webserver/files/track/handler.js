import { getStage } from '/js/getStage.js';
import { getInfo } from '/js/getInfo.js';

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

const { code, id } = getInfo();
const currentStage = window.location.href.split('/track/')[1].split('?')[0].split('/')[0];

const reloadCallbacks = [];
export function onReload(callback) {
    reloadCallbacks.push(callback);
}

reloadLoop();

async function reloadLoop() {
    while (true) {
        await reload();

        if (document.hasFocus())
            await wait(500);
        else
            await wait(2000);
    }
}

async function reload() {
    const newStage = await getStage({ code, id });
    if (newStage !== currentStage)
        if (newStage === 'null')
            return window.location.replace('/');
        else
            return window.location.replace(`/track/${newStage}?id=${id}`);

    for (const callback of reloadCallbacks)
        await callback();
}
