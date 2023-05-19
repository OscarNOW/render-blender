/*

--fileRequirements--
/common/apiKeys.js
/js/firebase.js
--endFileRequirements--

*/

import {
    initializeAppCheck,
    ReCaptchaV3Provider,
    getToken
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app-check.js';

import { publicRecaptchaV3Key } from '/common/apiKeys.js';
import { app } from '/js/firebase.js';

export const appCheck = await initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(publicRecaptchaV3Key),
    isTokenAutoRefreshEnabled: true
});

export const _ = { //todo: remove _ object
    getAppCheckHeaders: async () => ({
        'X-Firebase-AppCheck': (await getToken(appCheck, false)).token
    })
}
