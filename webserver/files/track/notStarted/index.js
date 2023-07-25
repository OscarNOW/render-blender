import '/track/handler.js';
import { getInfo } from '/js/getInfo.js';

const { code, id } = getInfo();
document.title = `Starting | ID ${id}`;

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', async () => {
    startButton.disabled = true;
    startButton.style.cursor = 'wait';

    await fetch(`/api/start?code=${code}&id=${id}`);
});
startButton.disabled = false;
startButton.style.cursor = null;