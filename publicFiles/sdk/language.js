/*

--fetchPriority--: high

--fileRequirements--
/common/deepQuerySelectorAll.js
/js/performance.js
/js/analytics.js
/api/messages
--endFileRequirements--

*/

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

import { deepQuerySelectorAll } from '/common/deepQuerySelectorAll.js';
import { startTrace, stopTrace } from '/js/performance.js';
import { updateEffectiveLanguage } from '/js/analytics.js';

let messages;

const slowMessageCache = {};
let getConfig;

startTrace('language_full');
startTrace('language_fast');

await execute(true);

stopTrace('language_fast');

await wait(700);
await execute(false);

stopTrace('language_full');

export function getMessage(message) {
    if (!message)
        return message;

    return findMessageInMessages(message) ||
        (findMessageInMessages(flipFirstLetterCase(message)) ?
            flipFirstLetterCase(findMessageInMessages(flipFirstLetterCase(message))) :
            message);
};

function findMessageInMessages(message) {
    return messages.pages?.[window.location.pathname]?.[message] || messages.general?.[message];
}

function flipFirstLetterCase(string) {
    return ((string[0].toUpperCase() === string[0]) ? string[0].toLowerCase() : string[0].toUpperCase()) + string.slice(1);
}

async function execute(isFast = true, language) {
    messages = await getMessagesFast();
    if (!isFast) {
        const newMessages = await getMessagesSlow(language || messages?.info?.code);
        messages = combineMessages(messages, newMessages);
    }
    updateEffectiveLanguage(messages.info.code);
    updateHtml();
}

async function getMessagesSlow(language) {
    if (slowMessageCache[language])
        return slowMessageCache[language];

    startTrace('language_getMessages_slow');

    if (!getConfig)
        ({ getConfig } = await import('/js/remoteConfig.js'));

    const config = await getConfig(`messages_${language}`);
    const newMessages = {};

    for (const [key, value] of Object.entries(config)) {
        let current = newMessages;

        for (let keyPartIndex in key.split('_')) {
            keyPartIndex = parseInt(keyPartIndex);
            const keyPart = key.split('_')[keyPartIndex];

            if (!current[keyPart])
                current[keyPart] = keyPartIndex === key.split('_').length - 1 ? value : {};

            current = current[keyPart];

        }
    }

    if (newMessages.pages)
        for (const [key, value] of Object.entries(newMessages.pages)) {
            delete newMessages.pages[key];
            newMessages.pages[key.replaceAll('1', '/')] = value;
        }

    stopTrace('language_getMessages_slow');
    slowMessageCache[language] = newMessages;
    return slowMessageCache[language];
}

async function getMessagesFast() {
    startTrace('language_getMessages_fast');

    let newMessages = await fetch('/api/messages', {
        method: 'GET',
        credentials: 'include',
        mode: 'no-cors' //to allow to use the preload
    });
    newMessages = await newMessages.json();

    stopTrace('language_getMessages_fast');
    return newMessages;
}

function updateHtml() {
    startTrace('language_transformHtml');

    const html = document.querySelector('html');
    html.lang = messages?.info?.code || 'en';

    const innerTextElements = deepQuerySelectorAll('[data-lang_text]');

    for (const element of innerTextElements)
        element.innerText = getMessage(element.dataset.lang_text);

    const placeholderElements = deepQuerySelectorAll('[data-lang_placeholder]');

    for (const element of placeholderElements)
        element.placeholder = getMessage(element.dataset.lang_placeholder);

    stopTrace('language_transformHtml');
}


//todo: add to shared folder so that Server uses same function
function combineMessages(oldMessages, newMessages) {
    const messages = Object.assign({}, oldMessages);

    for (const [key, newValue] of Object.entries(newMessages))
        if (messages[key] === undefined)
            messages[key] = newValue;
        else if (typeof newValue === 'object')
            messages[key] = combineMessages(messages[key], newValue);
        else
            messages[key] = newValue;

    return messages;
}

export const _ = {
    execute
}