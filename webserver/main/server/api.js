const apiPromise = require('../setup/preload/api.js').execute();

const isModuleInstalled = require('../functions/isModuleInstalled.js').execute;
const parseErrorOnline = require('../functions/error/parseErrorOnline.js').execute;

const statusCode = (response, code, { text, short }) => {
    response.writeHead(code, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({
        successful: `${code}`.startsWith('2'),
        code,
        text,
        short
    }));
}

module.exports = {
    async execute(request, response, { middlewareData, extraData }) {
        const parseError = async (error, text) => await parseErrorOnline({ error, request, response, text });

        try {
            const messages = (await require('../functions/get/messages.js').execute({ request })).messages;
            const { path, params, success } = require('../functions/parse/apiCall.js').execute(request);

            if (!success) {
                statusCode(response, 400, { text: 'Invalid request', short: 'invalidRequest' });
                return;
            }

            const api = await apiPromise;
            if (api[path])
                if (api[path].enabled.dependencies.installed) {
                    const file = api[path].file;
                    const executeFunctionExists = Boolean(file?.execute);

                    if (!executeFunctionExists)
                        return await parseError(new Error(messages.error.executeFunctionNotFoundWithFile.replace('{file}', path)), messages.error.executeFunctionNotFound);

                    let cacheHeaders = {};
                    if (!file.info?.cache?.enabled)
                        cacheHeaders = { 'Cache-Control': 'private, max-age=0, no-cache, no-store, must-revalidate' };
                    else
                        cacheHeaders = {
                            'Cache-Control': `${file.info.cache.private ? 'private' : 'public'}, max-age=${file.info.cache.minutes * 60}, stale-while-revalidate=${file.info.cache.staleUseMinutes * 60}, stale-if-error=${file.info.cache.errorUseMinutes * 60}`,
                            'Vary': (file.info.cache.vary || []).join(', ')
                        }

                    if (request.method === 'GET')
                        file.execute({
                            statusCode: (code, short, text) => {
                                statusCode(response, code, { text, short });
                            },
                            parseError,
                            end: (data) => {
                                let type;
                                if (typeof data === 'string')
                                    type = 'text/plain';
                                else if (typeof data === 'object')
                                    type = 'application/json';

                                response.writeHead(200, {
                                    ...cacheHeaders,
                                    'Content-Type': type,
                                    'Content-Length': Buffer.byteLength(data)
                                });

                                response.end(data);
                            },
                            request,
                            isModuleInstalled,
                            params,
                            response,
                            middlewareData,
                            extraData
                        });
                    else
                        statusCode(response, 405, { text: 'Method not allowed', short: 'methodNotAllowed' });
                } else
                    return await parseError(new Error(messages.error.moduleNotInstalledForShort.replace('{api}', path)), messages.error.moduleNotInstalledFor.replace('{api}', path).replace('{dependency}', api[path].enabled.dependencies.dependenciesNotInstalled.join(', ')));
            else
                return statusCode(response, 404, { text: messages.error.apiCallNotFound });

        } catch (err) {
            await parseError(err);
        }
    }
}