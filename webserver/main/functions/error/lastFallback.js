/*

Hello future self,
sorry for the spaghetti code. This file grew into something
out of my control. Normally I like spaghetti, but not this
much. I'm very sorry, but I'm too lazy to clean this up.

Again sorry,
your past self

(If you're someone else, this file isn't very interesting, see main/server/main.js instead)

*/

try {
    require('../../server/main')
} catch { }

const fs = require('fs');
const settings = require('../../../settings.json');
let gMessages = undefined;

let extremeErrorMode = false;
let reloadMode = 0;

let cConsole;
try {
    cConsole = require('../../../modules/console/functions/get.js');
} catch {
    cConsole = console;
}

let amountError = 0;
let lastError = '';
let lastErrorTime = 0;

module.exports = {
    async execute({ error: err, response, request }) {
        if (response)
            try {
                await require('./statusCode.js').execute({ request, response, code: 500 });
            } catch { }

        const timeDiff = new Date().getTime() - lastErrorTime;
        if (timeDiff > 1000) amountError = 0;
        let retry = true;

        const currentErr = `${err}`.split('\n')[0];
        if (currentErr === lastError && timeDiff < 1000) {
            amountError += 1;
        } else {
            lastError = currentErr;
            amountError = 1;
        }

        let stack = err?.stack;
        if (!stack) stack = new Error('No error stack given').stack.split('\n').splice(1).join('\n');

        const data = `${`${err}`.split('\n')[0]}\n\n\nStack${err?.stack ? '' : ' (No stack given)'}:\n${stack}`

        let errorPath = settings.generic.path.files.errors;
        if (!fs.existsSync(errorPath)) errorPath = './';

        fs.writeFileSync(`${errorPath}RAW1-${amountError}-${Math.floor(Math.random() * 1000)}.txt`, data);

        if (amountError > 5 && timeDiff < 1000) retry = false;
        cConsole.clear();

        if (retry) {

            reloadMode++;

            countDown(5, 1000, (ii) => {
                cConsole.clear();
                cConsole.log(`Retrying in ${ii} seconds...`);
            });

            setTimeout(() => {
                reloadMode--;
                lastErrorTime = new Date().getTime();

                try {
                    require('./evalErrors').execute();
                } catch { }
            }, 5000);

        } else {
            cConsole.log('No retry, because of looping error');
            extremeErrorMode = true;
        }

    },
    extremeServer(r, response) {
        response.writeHead(500, 'The server has an extreme error, please try again later');
        response.end('The server has an extreme error, please try again later');
        cConsole.warn('New request in extreme error mode')
    },
    async reloadServer(r, response) {
        if (gMessages === undefined)
            try {
                gMessages = (await require('../get/messages.js').execute()).messages;
            } catch {
                gMessages = null;
            }

        let messages;
        try {
            messages = (await require('../get/messages.js').execute({ request: r })).messages;
        } catch {
            messages = gMessages;
        }

        const reloadingPath = settings.generic.path.files.reloadingFile.replace('{files}', settings.generic.path.files.files);
        response.writeHead(500, 'The server is restarting due to an error.');
        try {
            const data = Buffer.from(fs.readFileSync(reloadingPath).toString('utf-8').replace('|reloadText|', messages ? messages.error.clientServerReload : ''));
            response.end(data);
        } catch (err) {
            response.end('The server is restarting due to an error.')
        }
    },
    async serverExecute(request, response) {
        if (extremeErrorMode) {
            const t = require(__filename);
            t.extremeServer(request, response);
        } else if (reloadMode > 0) {
            const t = require(__filename);
            await t.reloadServer(request, response);
        } else {
            try {
                require('../../server/main').execute(request, response);
            } catch (err) {
                err?.stack; // generate stack
                const t = require(__filename);
                t.execute({ error: err, response, request });
            }
        }
    }
}

function asyncTimeout(wait) {
    return new Promise((resolve) => setTimeout(resolve, wait))
}

async function countDown(start, wait, callback) {
    let ii = start;
    while (ii > 0) {
        callback(ii);
        ii--;
        await asyncTimeout(wait);
    }
    callback(0);
}