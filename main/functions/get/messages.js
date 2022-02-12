const settings = require('../../../settings.json');
const isModuleInstalled = require('../isModuleInstalled').execute;
const fs = require('fs');

let requestInfo;
if (isModuleInstalled('requestInfo')) {
    requestInfo = require(`../../../${settings.generic.path.files.modules}requestInfo/getInfo`).execute;
}

module.exports = {
    execute(argument) {
        let files = argument?.files;
        let request = argument?.request;

        let options = [];
        if (!files)
            files = fs.readdirSync(settings.generic.path.files.messages);

        files.forEach(val => {
            options.push(val.split('.json')[0]);
        })

        if (options.length < 1) {
            return null;
        }

        let userOptions = [];
        if (request && requestInfo)
            userOptions = requestInfo(request).lang || [];
        else
            if (request && request.headers['accept-language'])
                userOptions = [
                    {
                        name:
                            request.headers['accept-language']
                                .split(',')
                                .split(';')[0]
                                .split('-')[0],
                        quality: 1
                    }
                ]

        let lang;
        let found = false;

        if (request)
            userOptions.forEach(val => {
                if (found) return;
                if (options.includes(val.name)) {
                    lang = val.name;
                    found = true;
                }
            });

        settings.generic.lang.forEach(val => {
            if (found) return;
            if (options.includes(val)) {
                lang = val;
                found = true;
            }
        })

        if (!found) {
            lang = options[0];
            found = true;
        }

        return { lang, file: `${lang}.json`, mainPath: settings.generic.path.files.messages, mainFunction: () => { return JSON.parse(fs.readFileSync(`${settings.generic.path.files.messages}${lang}.json`)) } }

    }
}