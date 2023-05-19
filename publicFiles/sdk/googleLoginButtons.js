/*

--fetchPriority--: low

--fileRequirements--
/common/apiKeys.js
/common/doesDocumentIncludeScript.js
/common/isMobile.js
/sdk/auth.js
/js/performance.js
/js/analytics.js
--endFileRequirements--

*/

import {
    GoogleAuthProvider,
    signInWithCredential
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

import { googleSignInKey } from '/common/apiKeys.js';
import { doesDocumentIncludeScript } from '/common/doesDocumentIncludeScript.js';
import { isMobile } from '/common/isMobile.js';

import { auth } from '/sdk/auth.js';
import { startTrace, stopTrace } from '/js/performance.js';
import { logEvent } from '/js/analytics.js';

window.googleButtonPopupCallback = async ({ credential }) => {
    await signInWithCredential(auth, GoogleAuthProvider.credential(credential));
    logEvent('login', { method: 'google', initiator: 'button', type: 'popup' });
};

const urlParams = new URLSearchParams(window.location.search);

function getRedirectLocation() {
    if (urlParams.get('redirect'))
        if (new URL(urlParams.get('redirect')).origin !== window.location.origin)
            return window.location.href + '&instantRedirect=' + 'true';
        else {
            let location = urlParams.get('redirect');
            const url = new URL(location);

            if (url.search)
                location += '&signInWithGoogleRedirect=' + 'true';
            else if (location.endsWith('?'))
                location += 'signInWithGoogleRedirect=' + 'true';
            else
                location += '?signInWithGoogleRedirect=' + 'true';

            return location;
        }
    else
        return window.location.href;
}

startTrace('googleLoginButtons_transformButtons');

const smallButtons = [...document.getElementsByClassName('smallGoogleLoginButton')];

for (const smallButton of smallButtons) {
    //todo: add locale property (make sure it's in the correct format)
    const newSmallButton = document.createElement('div');
    newSmallButton.className = 'g_id_signin';
    newSmallButton.dataset.type = 'icon';
    newSmallButton.dataset.shape = 'circle';
    newSmallButton.dataset.theme = 'outline';
    newSmallButton.dataset.text = 'signin_with';
    newSmallButton.dataset.size = 'large';

    smallButton.replaceWith(newSmallButton);
}

const bigButtons = [...document.getElementsByClassName('bigGoogleLoginButton')];

for (const bigButton of bigButtons) {
    const newBigButton = document.createElement('div');
    newBigButton.className = 'g_id_signin';
    newBigButton.dataset.type = 'standard';
    newBigButton.dataset.shape = 'pill';
    newBigButton.dataset.theme = 'outline';
    newBigButton.dataset.text = 'signin_with';
    newBigButton.dataset.size = 'large';
    newBigButton.dataset.logo_alignment = 'left';

    bigButton.replaceWith(newBigButton);
}

stopTrace('googleLoginButtons_transformButtons');
startTrace('googleLoginButtons_addGoogleScript');

const googleOnLoadDiv = document.createElement('div');
googleOnLoadDiv.id = 'g_id_onload';
googleOnLoadDiv.dataset.client_id = googleSignInKey;
googleOnLoadDiv.dataset.context = 'signin';
if (isMobile()) {
    googleOnLoadDiv.dataset.ux_mode = 'redirect';
    googleOnLoadDiv.dataset.login_uri = getRedirectLocation();
} else {
    googleOnLoadDiv.dataset.ux_mode = 'popup';
    googleOnLoadDiv.dataset.callback = 'googleButtonPopupCallback';
}
googleOnLoadDiv.dataset.auto_prompt = 'false';

const documentIncludesGoogleTap = doesDocumentIncludeScript('/sdk/oneTap.js') || doesDocumentIncludeScript('/sdk/zeroTap.js');

if (documentIncludesGoogleTap)
    throw new Error("Document can't include both googleLoginButtons and (oneTap or zeroTap)")

if (document.getElementById('g_id_onload'))
    throw new Error('g_id_onload element already exists')
else
    document.head.appendChild(googleOnLoadDiv);

if ((!documentIncludesGoogleTap) && ((!window.defaultGoogleClients) || window.defaultGoogleClients.length === 0))
    if (doesDocumentIncludeScript('https://accounts.google.com/gsi/client'))
        throw new Error('Google Sign In script already exists')
    else {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        document.head.appendChild(script);
    };

if (!window.defaultGoogleClients) window.defaultGoogleClients = [];
window.defaultGoogleClients.push('googleLoginButtons');

stopTrace('googleLoginButtons_addGoogleScript');