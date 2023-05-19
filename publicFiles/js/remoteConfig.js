/*

--fetchPriority--: low

--fileRequirements--
/js/firebase.js
/js/performance.js
--endFileRequirements--

*/

import {
    getRemoteConfig,
    fetchAndActivate,
    getAll
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-remote-config.js';

const isNumber = (n) => !isNaN(parseFloat(n)) && !isNaN(n - 0);

import { app } from '/js/firebase.js';
import { startTrace, stopTrace } from '/js/performance.js';

export const remoteConfig = getRemoteConfig(app);
remoteConfig.settings.minimumFetchIntervalMillis = 5 * 60 * 1000; //todo: add to settings

const configCache = {};
export async function getConfig(group) {
    let cacheName;
    if (group)
        cacheName = group;
    else
        cacheName = '';

    if (configCache[cacheName])
        return configCache[cacheName];

    const fullConfig = await getFullConfig();
    const config = transformConfig(group, fullConfig);

    configCache[cacheName] = config;
    return configCache[cacheName];
}

let fullConfigCache;
async function getFullConfig() {
    if (fullConfigCache)
        return fullConfigCache;

    startTrace('remoteConfig_load');
    await fetchAndActivate(remoteConfig);
    fullConfigCache = await getAll(remoteConfig);
    stopTrace('remoteConfig_load');

    return fullConfigCache;
}

function transformConfig(group, config) {
    if (!config)
        return {};

    startTrace('remoteConfig_transform');
    const newConfig = {};

    for (const [key, value] of Object.entries(config)) {
        if (!key.includes(`${group}_`))
            continue;

        let newKey = key;
        if (group)
            newKey = key.split(`${group}_`).slice(1).join(`${group}_`);


        let newValue;

        if (!newValue) try {
            newValue = JSON.parse(value._value);
        } catch { }

        if (!newValue)
            if (isNumber(value.value)) newValue = parseFloat(value._value);

        if (!newValue)
            if (['true', 'false'].includes(value._value)) newValue = value._value === 'true';

        if (!newValue)
            newValue = value._value;

        newConfig[newKey] = newValue;
    }
    stopTrace('remoteConfig_transform');

    return newConfig;
}