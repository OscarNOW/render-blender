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

const ids = await fetch(`/api/getAllProjects?code=${code}`).then(resp => resp.json());
for (const id of ids)
    renderId(id);

async function renderId(id) {
    const tr = document.createElement('tr');

    const idTd = document.createElement('td');
    idTd.innerText = id;
    tr.appendChild(idTd);

    const stageId = document.createElement('td');
    stageId.innerText = '____';
    tr.appendChild(stageId);

    const actionTd = document.createElement('td');
    actionTd.innerText = 'todo'; //todo: add action buttons like delete and track
    tr.appendChild(actionTd);

    table.appendChild(tr);

    const stage = await fetch(`/api/getStage?code=${code}`)

}