const fs = require('fs');
const settings = require('../../../settings.json');
const mime = require('mime-types');
let gMessages = undefined;

module.exports = {
    async execute({ request, response, code, errorFile, text: customText }) {
        let text = '';

        if (gMessages === undefined)
            try {
                gMessages = (await require('../get/messages.js').execute({ request })).messages;
            } catch {
                gMessages = null;
            }

        let errorMessage;
        if (gMessages)
            errorMessage = gMessages.httpStatusCodes[(code + '').split('')[0] * 100];

        if (errorMessage) if (errorMessage[code]) text = errorMessage[code];

        const path = settings.generic.path.files.errorFile.replace('{files}', settings.generic.path.files.files);

        let data = fs.readFileSync(path);

        let newText = data.toString('utf-8').replace('|errorCode|', code).replace('|errorCodeMessage|', text).replace('|reloadText|', gMessages?.error?.reload ?? 'Reload');
        data = Buffer.from(newText, 'utf-8');

        if (errorFile) {
            newText = data.toString('utf-8').replace('|errorFile|', errorFile);
            data = Buffer.from(newText, 'utf-8');
        }

        if (customText) {
            newText = data.toString('utf-8').replace('|errorMessage|', customText);
            data = Buffer.from(newText, 'utf-8');
        }

        response.writeHead(code, { 'Content-Type': mime.lookup(path) });
        return response.end(data);
    }
}