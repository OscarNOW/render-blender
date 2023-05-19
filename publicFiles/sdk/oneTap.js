/*

--fetchPriority--: low

--fileRequirements--
/common/apiKeys.js
/common/doesDocumentIncludeScript.js
/js/performance.js
/sdk/auth.js
/js/analytics.js
--endFileRequirements--

*/

import {
    GoogleAuthProvider,
    signInWithCredential
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

import { googleSignInKey } from '/common/apiKeys.js';
import { doesDocumentIncludeScript } from '/common/doesDocumentIncludeScript.js';

import { startTrace, stopTrace } from '/js/performance.js';
import { auth, onStateChange } from '/sdk/auth.js';
import { logEvent } from '/js/analytics.js';

window.googleOneTapCallback = async ({ credential }) => {
    await signInWithCredential(auth, GoogleAuthProvider.credential(credential));
    logEvent('login', { method: 'google', initiator: 'oneTap', type: 'embedded' })
};

const googleOnLoadDiv = document.createElement('div');
googleOnLoadDiv.id = 'g_id_onload';
googleOnLoadDiv.dataset.client_id = googleSignInKey;
googleOnLoadDiv.dataset.context = 'signin';
googleOnLoadDiv.dataset.callback = 'googleOneTapCallback';
googleOnLoadDiv.dataset.close_on_tap_outside = 'false';
googleOnLoadDiv.dataset.itp_support = 'true';

let loaded = false;
onStateChange((user, isHint) => {
    if ((!loaded) && (!isHint)) {
        if (user) {
            googleOnLoadDiv.dataset.auto_prompt = 'false';
            addGoogleScript();
        } else
            executeOneTap();

        loaded = true;

        window.googleTapHasRun = true;
    }
});

function executeOneTap() {
    if (document.getElementById('g_id_onload'))
        throw new Error('g_id_onload element already exists')
    else
        document.body.appendChild(googleOnLoadDiv);

    addGoogleScript();
};

function addGoogleScript() {
    startTrace('oneTap_addGoogleScript');

    if (doesDocumentIncludeScript('https://accounts.google.com/gsi/client'))
        throw new Error('Google Sign In script already exists');
    else {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        document.head.appendChild(script);
    };

    stopTrace('oneTap_addGoogleScript');
};