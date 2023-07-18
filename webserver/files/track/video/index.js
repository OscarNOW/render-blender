import '/track/handler.js';
import { getInfo } from '/js/getInfo.js';

const { id } = getInfo();

document.title = `Video | ID ${id}`;