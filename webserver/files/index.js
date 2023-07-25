import { getCookie } from '/js/cookie.js';
const code = getCookie('code');
if (!code) window.location.href = '/getCode';

const path = document.getElementById('path');
const form = document.getElementById('form');
const table = document.getElementById('table');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const resp = await fetch(`/api/render?code=${code}&filePath=${path.value}`);
    const id = await resp.text();

    window.location.href = `/track?id=${id}`;

    return;
});

loadIds();
async function loadIds() {
    //todo-imp: clear table

    const ids = await fetch(`/api/getAllProjects?code=${code}`).then((resp) => resp.json());
    for (const id of ids)
        renderId(id);
}

async function renderId(id) {
    const tr = document.createElement('tr');

    const idTd = document.createElement('td');
    idTd.innerText = id;
    tr.appendChild(idTd);

    const stageTd = document.createElement('td');
    stageTd.innerText = '____';
    tr.appendChild(stageTd);

    const actionTd = document.createElement('td');

    const trackButton = document.createElement('button');
    trackButton.innerText = 'track';
    trackButton.addEventListener('click', () => {
        window.location.href = `/track?id=${id}`;
    });
    actionTd.appendChild(trackButton);

    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'delete';
    deleteButton.addEventListener('click', async () => {
        deleteButton.disabled = true;
        deleteButton.style.cursor = 'loading';

        await fetch(`/api/delete?code=${code}&id=${id}`);

        deleteButton.disabled = false;
        deleteButton.style.cursor = null;

        loadIds(); //reload the table
    });
    actionTd.appendChild(deleteButton);

    //todo: add stop button
    //todo: add start button

    tr.appendChild(actionTd);

    //todo: add project path

    table.appendChild(tr);

    await updateStage(id, stageTd);
    setInterval(() => updateStage(id, stageTd), 2000);
}

async function updateStage(id, stageTd) {
    const stage = await fetch(`/api/getStage?code=${code}&id=${id}`).then((resp) => resp.text());
    stageTd.innerText = stage;
}