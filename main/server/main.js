const fs = require('fs');
const path = require('path');

const middlewares = fs.existsSync(path.resolve(__dirname, './middleware/')) ?
    fs.readdirSync(path.resolve(__dirname, './middleware/')).map((a) => ({ ...require(`./middleware/${a}`), name: a.split('.')[0] })) :
    [];

const parseErrorOnline = require('../functions/error/parseErrorOnline.js').execute;
const parsePostBody = require('../functions/parse/postBody.js');

const api = require('./api.js');
const normal = require('./normal.js');
const upload = require('./upload.js');

module.exports = {
    async execute(request, response) {
        console.log(request.url)

        const parseError = async (error, text) => await parseErrorOnline({ error, request, response, text });

        try {
            let body;
            if (request.method === 'POST')
                body = parsePostBody(await waitPost(request));

            const extraData = { body };

            let responded = false;
            let cachedMiddlewareData = {};
            const executedMiddlewares = [];

            async function executeMiddleware(name) {
                if (executedMiddlewares.includes(name)) return true;
                const middleware = middlewares.find((a) => a.name === name);

                for (const name of middleware.info?.requires ?? [])
                    if (!await executeMiddleware(name)) return false;

                const newMiddlewareData = await middleware.execute({
                    request,
                    extraData,
                    parseError: async (...arg) => {
                        if (!responded) {
                            responded = true;
                            await parseError(...arg);
                        }
                    },
                    middlewareData: cachedMiddlewareData
                });

                executedMiddlewares.push(name);
                if (!newMiddlewareData) return false;

                cachedMiddlewareData = { ...cachedMiddlewareData, ...newMiddlewareData };

                return !responded;
            };

            for (const { name, info } of middlewares)
                if (info?.requireRun)
                    if (!await executeMiddleware(name)) return;

            const middlewareData = {};
            for (const { info, name } of middlewares)
                for (const exportName of info?.exports ?? [])
                    Object.defineProperty(middlewareData, exportName, {
                        configurable: false,
                        enumerable: true,
                        get: async () => {
                            if (!await executeMiddleware(name)) return;
                            return cachedMiddlewareData[exportName];
                        }
                    });

            if (!responded)
                if (request.url.startsWith('/upload'))
                    return await upload.execute(request, response, { middlewareData, extraData });
                else if (request.url.startsWith('/api/'))
                    return await api.execute(request, response, { middlewareData, extraData });
                else
                    return normal.execute(request, response, { middlewareData, extraData });

        } catch (err) {
            await parseError(err);
        }
    }
}

function waitPost(request) {
    return new Promise((res) => {
        const maxBytes = 500000000; //500mb

        let body = Buffer.alloc(0);
        request.on('data', (data) => {
            body = Buffer.concat([body, data]);

            if (body.byteLength > maxBytes)
                request.connection.destroy();
        });

        request.on('end', () => {
            res(body);
        });

    });
}