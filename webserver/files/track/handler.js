import { getState } from '/js/getState.js';
import { getInfo } from '/js/getInfo.js';

const { code, id } = getInfo();
const currentState = window.location.href.split('/track/')[1].split('?')[0].split('/')[0];

const reloadCallbacks = [];
export function onReload(callback) {
    reloadCallbacks.push(callback);
}

setInterval(reload, 500);
async function reload() {
    const newState = await getState({ code, id });
    if (newState !== currentState) return window.location.replace(`/track/${newState}?id=${id}`);

    for (const callback of reloadCallbacks)
        await callback();
}