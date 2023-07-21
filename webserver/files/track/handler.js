import { getState } from '/js/getState.js';
import { getInfo } from '/js/getInfo.js';

const { code, id } = getInfo();
const ourState = window.location.href.split('/track/')[1].split('?')[0].split('/')[0];

const reloadCallbacks = [];
export function onReload(callback) {
    reloadCallbacks.push(callback);
}

setInterval(reload, 500);
async function reload() {
    const currentState = await getState({ code, id });
    if (currentState !== ourState) return window.location.replace(`/track?id=${id}`);

    for (const callback of reloadCallbacks)
        await callback();
}