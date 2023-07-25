import '/track/handler.js';
import { getInfo } from '/js/getInfo.js';

const { code, id } = getInfo();
document.title = `Error | ID ${id}`;

const errorReason = await fetch(`/api/getError?code=${code}&id=${id}`).then((resp) => resp.text());
document.getElementById('errorReason').innerText = errorReason;