const api = require('../setup/preload/api.js').execute();
const settings = require('../../settings.json');

const isModuleInstalled = require('../functions/isModuleInstalled.js').execute;
const statusCode = require('../functions/error/statusCode.js').execute;
const parseErrorOnline = require('../functions/error/parseErrorOnline.js').execute;

module.exports = {
    execute(request, response) {
        let messages = require('../functions/get/messages').execute({ request }).mainFunction();

        let parseError = (error, customText) => parseErrorOnline(error, response, customText);

        let { path, params } = require('../functions/parse/apiCall.js').execute(request.url);

        if (api[path]) {
            if (api[path].enabled.dependencies.installed) {
                let ex = api[path].file;

                let exists = true;
                try {
                    if (!ex.execute) exists = false;
                } catch {
                    exists = false;
                }

                if (!exists) return parseError(new Error(messages.error.executeFunctionNotFoundWithFile.replace('{file}', path)), messages.error.executeFunctionNotFound);

                if (request.method == 'POST') {
                    let body = '';
                    request.on('data', function (data) {
                        body += data;
                    });
                    request.on('end', async function () {
                        let cont = {};
                        body.split('&').forEach((val, index) => {
                            let key = decodeURIComponent(val.split('=')[0].replace(/\+/g, ' '));
                            let value = decodeURIComponent(val.split('=')[1].replace(/\+/g, ' '));
                            cont[key] = decodeURIComponent(value);
                        });
                        params = cont;
                        ex.execute({
                            statusCode: (code, text) => {
                                statusCode(response, code, { text: text });
                            },
                            parseError,
                            end: (data) => {
                                response.end(data);
                            },
                            request,
                            isModuleInstalled,
                            params,
                            response
                        });
                    });
                } else {
                    ex.execute({
                        statusCode: (code, text) => {
                            statusCode(response, code, { text: text });
                        },
                        parseError,
                        end: (data) => {
                            response.end(data);
                        },
                        request,
                        isModuleInstalled,
                        params,
                        response
                    });
                }
            } else
                if (isModuleInstalled('text')) {
                    let list = require(`../../${settings.generic.path.files.modules}text/createList.js`).createList(api[path].enabled.dependencies.dependenciesNotInstalled);
                    return parseError(new Error(messages.error.moduleNotInstalledForShort.replace('{api}', path)), messages.error.modulesNotInstalledFor.replace('{api}', path).replace('{dependencie}', list));
                } else
                    return parseError(new Error(messages.error.moduleNotInstalledForShort.replace('{api}', path)), messages.error.moduleNotInstalledFor.replace('{api}', path).replace('{dependencie}', api[path].enabled.dependencies.dependenciesNotInstalled[0]));
        } else
            return statusCode(response, 404, { text: messages.error.apiCallNotFound });

        return;
    }
}