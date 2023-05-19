/*

--fetchPriority--: low

--fileRequirements--
/common/apiKeys.js
/common/doesDocumentIncludeScript.js
/js/performance.js
/js/analytics.js
--endFileRequirements--

*/

import {
    publicRecaptchaV3Key,
    publicRecaptchaV2Key
} from '/common/apiKeys.js';
import { doesDocumentIncludeScript } from '/common/doesDocumentIncludeScript.js';

import { startTrace, stopTrace, cancelTrace } from '/js/performance.js';
import { logEvent } from '/js/analytics.js';

async function getScoreFromV3Token(token) {
    startTrace('recaptcha_getResult_v3');

    const res = await fetch(`/api/recaptchaV3?token=${token}`);
    if (!res.ok) {
        console.error('Recaptcha v3 check failed');
        cancelTrace('recaptcha_getResult_v3');
        return 0;
    }
    const score = parseFloat(await res.text());

    stopTrace('recaptcha_getResult_v3');
    return score;
};

async function checkSuccessFromV2Token(token) {
    try {
        startTrace('recaptcha_getResult_v2');

        const res = await fetch(`/api/recaptchaV2?token=${token}`);
        if (!res.ok) {
            console.error('Recaptcha v2 check failed');
            cancelTrace('recaptcha_getResult_v2');
            return false;
        }
        const success = await res.json();

        stopTrace('recaptcha_getResult_v2');
        return success;
    } catch (e) {
        console.error(e);
        return false;
    }
}

function waitReady() {
    return new Promise((res) => {
        grecaptcha.ready(res);
    });
};

export async function getScore(action = 'SDK_execute') {
    startTrace('recaptcha_getScore');

    await waitReady();
    const token = await grecaptcha.execute(publicRecaptchaV3Key, { action });
    const score = await getScoreFromV3Token(token);

    stopTrace('recaptcha_getScore');
    logEvent('recaptcha_getScore', { action, score });

    return score;
}

function renderV2Button(element) {
    startTrace('recaptcha_renderV2Button');
    const callbacks = [];
    const button = {
        state: 'ready',
        onStateChange: (cb) => {
            callbacks.push(cb);
        }
    };

    const setState = (state) => {
        button.state = state;
        for (const cb of callbacks)
            cb(button);
    };

    grecaptcha.render(element, {
        sitekey: publicRecaptchaV2Key,
        callback: async (token) => {
            if (await checkSuccessFromV2Token(token)) {
                setState('success')
                logEvent('recaptcha_v2Button_newState_success');
            } else {
                setState('error')
                logEvent('recaptcha_v2Button_newState_error');
            }
        },
        'error-callback': () => {
            setState('error')
            logEvent('recaptcha_v2Button_newState_error');
        },
        'expired-callback': () => {
            setState('expired')
            logEvent('recaptcha_v2Button_newState_expired');
        }
    });
    logEvent('recaptcha_v2Button_render');

    stopTrace('recaptcha_renderV2Button');
    return button;
}

export async function createButton(element) {
    if (!element)
        throw new Error('No element provided to createButton')

    await waitReady();
    const button = renderV2Button(element);

    return button;
}

// hide recaptcha badge
const style = document.createElement('style');
style.innerHTML = `
    .grecaptcha-badge { visibility: hidden; }
`;
document.head.appendChild(style);

function googleCaptchaV3Callback(id) {
    return async function (token) {
        const element = document.getElementById(id);
        if (element.dataset['recaptcha_loading_class'])
            element.classList.add(element.dataset['recaptcha_loading_class']);

        const score = await getScoreFromV3Token(token);

        logEvent('recaptcha_v3Button_click', { score });

        window[element.dataset['recaptcha_callback']]?.(score);

        if (element.dataset['recaptcha_loading_class'])
            element.classList.remove(element.dataset['recaptcha_loading_class']);
    };
};

startTrace('recaptcha_transformV3Buttons');

const v3RecaptchaButtons = [...document.getElementsByClassName('v3RecaptchaButton')];
for (const v3RecaptchaButton of v3RecaptchaButtons) {
    if (!v3RecaptchaButton.id) {
        console.error('captchaButton must have an id attribute', v3RecaptchaButton);
        continue;
    }

    const newV3CaptchaButton = document.createElement('button');

    for (const key of Object.keys(v3RecaptchaButton.dataset))
        newV3CaptchaButton.dataset[key] = v3RecaptchaButton.dataset[key];

    newV3CaptchaButton.innerText = v3RecaptchaButton.innerText;
    newV3CaptchaButton.id = v3RecaptchaButton.id;
    newV3CaptchaButton.dataset['recaptcha_callback'] = v3RecaptchaButton.dataset['recaptcha_callback'];
    newV3CaptchaButton.dataset['recaptcha_loading_class'] = v3RecaptchaButton.dataset['recaptcha_loading_class'];

    newV3CaptchaButton.dataset.action = v3RecaptchaButton.dataset['recaptcha_action'] ?? 'SDK_v3RecaptchaButton';
    newV3CaptchaButton.dataset.callback = `googleCaptchaV3Callback-${v3RecaptchaButton.id}`;
    window[`googleCaptchaV3Callback-${v3RecaptchaButton.id}`] = googleCaptchaV3Callback(v3RecaptchaButton.id);

    newV3CaptchaButton.className = 'g-recaptcha';
    newV3CaptchaButton.dataset.sitekey = publicRecaptchaV3Key;

    v3RecaptchaButton.replaceWith(newV3CaptchaButton);
}

stopTrace('recaptcha_transformV3Buttons');

if (!doesDocumentIncludeScript('https://www.google.com/recaptcha/api.js')) {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${publicRecaptchaV3Key}`;
    document.head.appendChild(script);
}