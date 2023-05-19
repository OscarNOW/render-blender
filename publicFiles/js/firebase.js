/*

--fileRequirements--
/common/apiKeys.js
--endFileRequirements--

*/

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js';
import { firebaseConfig } from '/common/apiKeys.js';

window.performance.mark('firebase_init_start')

export const app = initializeApp(firebaseConfig);

window.performance.mark('firebase_init_end')
window.performance.measure('firebase_init', 'firebase_init_start', 'firebase_init_end')