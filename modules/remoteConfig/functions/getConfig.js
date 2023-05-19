const settings = require('../../../settings.json')
const firebase = require('./getFirebase.js');
const fs = require('fs');
const path = require('path');

const cacheManifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../cache/manifest.json')).toString());

async function getConfigFromCache(group) {

    let cacheFileName;

    if (group)
        cacheFileName = `group_${group}.json`;
    else
        cacheFileName = 'noGroup.json';

    if (fs.existsSync(path.resolve(__dirname, `../cache/${cacheFileName}`))) {
        if ((new Date().getTime() - cacheManifest[cacheFileName].age) > (settings.cache.remoteConfig * 60 * 1000))
            updateCache(group); //don't await so we can return the cached value and update the cache in the background

        return JSON.parse(fs.readFileSync(path.resolve(__dirname, `../cache/${cacheFileName}`)).toString());
    }

    const config = await getConfig(group);

    fs.writeFileSync(path.resolve(__dirname, `../cache/${cacheFileName}`), JSON.stringify(config));
    cacheManifest[cacheFileName] = {
        age: new Date().getTime()
    };
    fs.writeFileSync(path.resolve(__dirname, '../cache/manifest.json'), JSON.stringify(cacheManifest));

    return config;
}

const cacheUpdating = [];
async function updateCache(group) {
    let cacheFileName;

    if (group)
        cacheFileName = `group_${group}.json`;
    else
        cacheFileName = 'noGroup.json';

    if (cacheUpdating.includes(cacheFileName))
        return;

    cacheUpdating.push(cacheFileName);

    const config = await getConfig(group);

    fs.writeFileSync(path.resolve(__dirname, `../cache/${cacheFileName}`), JSON.stringify(config));
    cacheManifest[cacheFileName] = {
        age: new Date().getTime()
    };
    fs.writeFileSync(path.resolve(__dirname, '../cache/manifest.json'), JSON.stringify(cacheManifest));

    cacheUpdating.splice(cacheUpdating.indexOf(cacheFileName), 1);
}

async function getConfig(group) {
    let config;
    if (group)
        config = (await firebase.remoteConfig().getTemplate()).parameterGroups[group].parameters;
    else
        config = (await firebase.remoteConfig().getTemplate()).parameters;

    const newConfig = transformConfig(group, config);

    return newConfig;
}

function transformConfig(group, config) {
    if (!config)
        return {};

    const newConfig = {};

    for (const [key, value] of Object.entries(config)) {
        let newKey = key;
        if (group && newKey.startsWith(`${group}_`))
            newKey = newKey.split(`${group}_`).slice(1).join(`${group}_`);

        if (value.valueType === 'JSON')
            newConfig[newKey] = JSON.parse(value.defaultValue?.value);
        else if (value.valueType === 'STRING')
            newConfig[newKey] = value.defaultValue?.value;
        else
            throw new Error(`Remote-config valueType ${value.valueType} not implemented`)
    }

    return newConfig;
}

module.exports = getConfigFromCache;