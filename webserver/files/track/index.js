import { getInfo } from '/js/getInfo.js';
import { getStage } from '/js/getStage.js';
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

const { code, id } = getInfo();

document.title = `____ | ID ${id}`;
await redirect();

async function redirect() {
    const stage = await getStage({ code, id });
    if (stage === null) {
        await wait(1000);
        await redirect();
        return;
    }

    window.location.replace(`/track/${stage}?id=${id}`);
}