const fs = require('fs');
const { readdirSync, existsSync, statSync } = fs;
const isModuleInstalled = require('../../functions/isModuleInstalled').execute;
const parseErrorRaw = require('../../functions/error/parseErrorRaw').execute;
const evalErrors = require('../../functions/error/evalErrors').execute;
const messages = require('../../functions/get/messages').execute().mainFunction()

const generic = require('../../../settings.json').generic;
let api = {};

//Load website api
addApiCalls('/', generic.path.files.api);

//Load module api
readdirSync(generic.path.files.modules).forEach(moduleName => {
    let apiPath = generic.path.files.moduleApi.replace('{modules}', generic.path.files.modules).replace('{name}', moduleName);
    addApiCalls('/', apiPath);
})

function addApiCalls(websitePath, path) {
    if (existsSync(path)) {
        readdirSync(path).forEach((apiName) => {
            if (statSync(`${path}${apiName}`).isDirectory())
                addApiCalls(`${websitePath}${apiName}/`, `${path}${apiName}/`);
            else {
                let req = require(`../../../${path}${apiName}`);
                apiName = apiName.split('.js')[0];
                let dependenciesInstalled = true;
                let dependenciesNotInstalled = [];
                if (req.dependencies && req.dependencies.modules)
                    req.dependencies.modules.forEach((val) => {
                        if (!existsSync(`${generic.path.files.modules}${val}/`)) {
                            dependenciesInstalled = false;
                            dependenciesNotInstalled.push(val);
                        }
                    });

                api[`${websitePath}${apiName}`] = {
                    file: require(`../../../${path}${apiName}`),
                    enabled: {
                        dependencies: {
                            installed: dependenciesInstalled,
                            dependenciesNotInstalled
                        }
                    }
                };
                if (!dependenciesInstalled) {
                    if (isModuleInstalled('text')) {
                        let list = require(`../../../${generic.path.files.modules}text/createList.js`).createList(dependenciesNotInstalled);
                        parseErrorRaw(new Error(messages.error.moduleNotInstalledForShort.replace('{api}', `${websitePath}${apiName}`)), messages.error.modulesNotInstalledFor.replace('{api}', `${websitePath}${apiName}`).replace('{dependencie}', list));
                    } else
                        parseErrorRaw(new Error(messages.error.moduleNotInstalledForShort.replace('{api}', `${websitePath}${apiName}`)), messages.error.moduleNotInstalledFor.replace('{api}', `${websitePath}${apiName}`).replace('{dependencie}', dependenciesNotInstalled[0]));
                    evalErrors();
                }
            }
        });
    }
}

module.exports = {
    execute() {
        return api;
    }
}