import { getCookie } from '/js/cookie.js';
const code = getCookie('code');
if (!code) window.location.href = '/getCode';

const path = document.getElementById('path');
const form = document.getElementById('form');
const table = document.getElementById('table');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const resp = await fetch(`/api/create?code=${code}&filePath=${path.value}`);
    const id = await resp.text();

    window.location.href = `/track?id=${id}`;

    return;
});

loadIds();
async function loadIds() {
    const ids = await fetch(`/api/getAllProjects?code=${code}`).then((resp) => resp.json());

    while ([...table.children].length > 1)
        table.lastChild.remove();

    for (const id of ids)
        renderId(id);
}

async function renderId(id) {
    const tr = document.createElement('tr');

    const idTd = document.createElement('td');
    idTd.classList.add('id');
    idTd.innerText = id;
    tr.appendChild(idTd);

    const stageTd = document.createElement('td');
    stageTd.classList.add('stage');
    stageTd.innerText = '____';
    tr.appendChild(stageTd);

    const actionTd = document.createElement('td');
    actionTd.classList.add('action');

    const trackButton = document.createElement('button');
    trackButton.classList.add('track');
    trackButton.innerText = 'track';
    trackButton.addEventListener('click', () => {
        window.location.href = `/track?id=${id}`;
    });
    actionTd.appendChild(trackButton);

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete');
    deleteButton.innerText = 'delete';
    deleteButton.addEventListener('click', async () => {
        deleteButton.disabled = true;
        deleteButton.style.cursor = 'wait';

        await fetch(`/api/delete?code=${code}&id=${id}`);

        deleteButton.disabled = false;
        deleteButton.style.cursor = null;

        tr.remove();
    });
    actionTd.appendChild(deleteButton);

    const startButton = document.createElement('button');
    startButton.classList.add('start');
    startButton.innerText = 'start';
    startButton.addEventListener('click', async () => {
        startButton.disabled = true;
        startButton.style.cursor = 'wait';

        await fetch(`/api/start?code=${code}&id=${id}`);

        startButton.disabled = false;
        startButton.style.cursor = null;
    });
    actionTd.appendChild(startButton);

    //todo: add stop button

    tr.appendChild(actionTd);

    const pathTd = document.createElement('td');
    pathTd.classList.add('path');
    pathTd.innerText = '____________________________________________________________';
    tr.appendChild(pathTd);

    table.appendChild(tr);

    await Promise.all([updateStage(id, stageTd), updatePath(id, pathTd)]);
    setInterval(() => updateStage(id, stageTd), 2000);
}

async function updatePath(id, pathTd) {
    const path = await fetch(`/api/getPath?code=${code}&id=${id}`).then((resp) => resp.text());
    pathTd.innerText = path;
}

async function updateStage(id, stageTd) {
    const stage = await fetch(`/api/getStage?code=${code}&id=${id}`).then((resp) => resp.text());
    stageTd.innerText = stage;
}