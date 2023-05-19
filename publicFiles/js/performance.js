/*

--fileRequirements--
/js/firebase.js
--endFileRequirements--

*/

import {
    getPerformance,
    trace
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-performance.js';

import { app } from '/js/firebase.js';

export const performance = getPerformance(app);

//todo: inline this script, because script is very small
const script = document.createElement('script');
script.src = 'https://www.unpkg.com/first-input-delay@0.1.3/dist/first-input-delay.min.js';
document.body.appendChild(script);

const traces = {};
export function startTrace(name) {
    if (traces[name])
        throw new Error(`Trace with name ${name} already started`)

    const t = trace(performance, name);
    traces[name] = t;

    t.start();
}

export function stopTrace(name) {
    const t = traces[name];
    if (!t) throw new Error(`No trace found with name ${name}`)

    t.stop();
    delete traces[name];
}

export function cancelTrace(name) {
    if (!traces[name]) return;

    delete traces[name];
}