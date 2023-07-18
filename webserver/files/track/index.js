import { getInfo } from '/js/getInfo.js';
import { getState } from '/js/getState.js';
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

const { code, id } = getInfo();

document.title = `____ | ID ${id} | ____`;
await redirect();

async function redirect() {
    const state = await getState({ code, id });
    if (state === null) {
        await wait(1000);
        await redirect();
        return;
    }

    window.location.replace(`/track/${state}?id=${id}`);
}