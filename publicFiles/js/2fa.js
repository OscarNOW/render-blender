/*

--fetchPriority--: low

--fileRequirements--
/js/analytics.js
/sdk/auth.js
--endFileRequirements--

*/

import {
    multiFactor,
    PhoneAuthProvider,
    RecaptchaVerifier,
    PhoneMultiFactorGenerator
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

import { logEvent } from '/js/analytics.js';
import { auth } from '/sdk/auth.js';

const id = '2faRecaptchaButton';

const _2FaRecaptchaButton = document.getElementById(id);
if (!_2FaRecaptchaButton)
    throw new Error(`No element with id "${id}" found`);

let recaptchaDoneCallbacks = [];
let recaptchaStateChangeCallbacks = [];
let recaptchaObject = { state: 'ready', onStateChange: (callback) => { recaptchaStateChangeCallbacks.push(callback); } };
const __recaptchaVerifier = new RecaptchaVerifier(_2FaRecaptchaButton, {
    size: 'normal',
    callback: () => {
        if (recaptchaObject.state === 'waiting')
            recaptchaObject.state = 'success'
        else
            recaptchaObject.state = 'successBefore';
        for (const recaptchaStateChangeCallback of recaptchaStateChangeCallbacks)
            recaptchaStateChangeCallback(recaptchaObject);
        for (const recaptchaDoneCallback of recaptchaDoneCallbacks)
            recaptchaDoneCallback([__recaptchaVerifier, recaptchaObject]);
    },
    'expired-callback': () => {
        recaptchaObject.state = 'expired';
        for (const recaptchaStateChangeCallback of recaptchaStateChangeCallbacks)
            recaptchaStateChangeCallback(recaptchaObject);
    }
}, auth);
let recaptchaRenderPromise = __recaptchaVerifier.render();

export const _ = {
    getRecaptchaVerifier() {
        _2FaRecaptchaButton.style.display = null;

        if (['success', 'expired'].includes(recaptchaObject.state)) {
            recaptchaObject.state = 'ready';
            recaptchaStateChangeCallbacks = [];
            recaptchaDoneCallbacks = [];
            recaptchaObject = { state: recaptchaObject.state, onStateChange: (callback) => { recaptchaStateChangeCallbacks.push(callback); } };

            __recaptchaVerifier.clear();
            recaptchaRenderPromise = __recaptchaVerifier.render();
        };
        if (recaptchaObject.state === 'successBefore') {
            recaptchaObject.state = 'success';
            return Promise.resolve([__recaptchaVerifier, recaptchaObject]);
        };
        recaptchaObject.state = 'waiting';

        return new Promise(async (res) => {
            await recaptchaRenderPromise;
            recaptchaDoneCallbacks.push(res);
        });
    },
    hide2faRecaptchaButton() {
        _2FaRecaptchaButton.style.display = 'none';
    }
};

export const add = async (phoneNumber, displayName) => {
    if (!window.auth.user)
        throw new Error('User is not logged in');
    if (window.auth.user.loginMethod !== 'email')
        throw new Error('User must be logged in with email');
    if (!window.auth.user.emailVerified)
        throw new Error('User email must be verified');

    const multiFactorUser = multiFactor(auth.currentUser);

    const multiFactorSession = await multiFactorUser.getSession();
    const phoneInfoOptions = {
        phoneNumber: phoneNumber,
        session: multiFactorSession
    };

    const [recaptchaVerifier, recaptchaButton] = await _.getRecaptchaVerifier();

    const phoneAuthProvider = new PhoneAuthProvider(auth);
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier);
    logEvent('2fa_add_code_send')

    return [async (verificationCode) => {
        const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
        const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential);
        await multiFactor(auth.currentUser).enroll(multiFactorAssertion, displayName);
        logEvent('2fa_add')
    }, recaptchaButton];
};

export const remove = async (index) => {
    if (!window.auth.user)
        throw new Error('User is not logged in');

    const multiFactorUser = multiFactor(auth.currentUser);
    const uid = multiFactorUser.enrolledFactors[index].uid;

    await multiFactorUser.unenroll(uid);
    logEvent('2fa_remove')
}