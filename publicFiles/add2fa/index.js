/*

--fetchPriority--: high

--fileRequirements--
/js/2fa.js
/sdk/templates.js
--endFileRequirements--

*/

import {
    add
} from '/js/2fa.js';

import {
    replaceTemplates
} from '/sdk/templates.js';

const phoneNumberInput = document.getElementById('phoneNumber');
const displayNameInput = document.getElementById('displayName');
const enableButton = document.getElementById('enable2faButton');

const verificationCodeInput = document.getElementById('verificationCode');
const verifyButton = document.getElementById('verify2faButton');

let confirm;
let recaptchaButton;
window.doVerify2fa = async () => {
    if (!confirm)
        throw new Error('Must enable before verifying');

    verifyButton.disabled = true;
    await confirm(verificationCodeInput.value);
    confirm = null;
    enableButton.disabled = false;
}

window.doAdd2fa = async () => {
    const phoneNumber = phoneNumberInput.value;
    const displayName = displayNameInput.value;
    ([confirm, recaptchaButton] = await add(phoneNumber, displayName).catch((e) => {
        console.log(e)
        window.verificationStyle = 'display: none;';
        window.addTwofaStyle = 'display: block;';
    }).finally(() => {
        window.verificationStyle = 'display: block;';
        window.addTwofaStyle = 'display: none;';
        replaceTemplates();
    }));
    recaptchaButton.onStateChange((recaptchaButton) => {
        console.log(recaptchaButton.state);
    })
}


window.addDisabled = true;

window.verificationStyle = 'display: none;';
window.addTwofaStyle = 'display: block;';

const checkIfValid = () => {
    return phoneNumberInput.value !== '' && phoneNumberInput.value.match(/^\+?[0-9]\d{9,12}$/);
}
phoneNumberInput.addEventListener('input', {
    handleEvent: () => {
        window.addDisabled = !checkIfValid();
        replaceTemplates();
    }
});
verificationCodeInput.addEventListener('input', {
    handleEvent: () => {
        window.verifyDisabled = verificationCodeInput.value === '' || verificationCodeInput.value.length !== 6;
        replaceTemplates();
    }
});



replaceTemplates();