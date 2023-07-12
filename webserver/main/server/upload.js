const fs = require('fs');
const path = require('path');

const statusCode = require('../functions/error/statusCode.js').execute;

const { code } = require('../../secret.json');

function execute(request, response, { extraData: { body } }) {
    const urlSearchParams = new URLSearchParams(request.url.split('?')[1]);

    if (urlSearchParams.get('code') !== code) return statusCode({ request, response, code: 403, text: 'Wrong code' });
    if (!urlSearchParams.get('fileName')) return statusCode({ request, response, code: 403, text: 'No fileName provided' });

    const baseFilePath = path.join(__dirname, '../../../worker/userFiles/');
    const filePath = path.join(baseFilePath, urlSearchParams.get('fileName'));

    if (!filePath.startsWith(baseFilePath)) return statusCode({ request, response, code: 403, text: 'Invalid file path' });

    fs.writeFileSync(filePath, body);
}

module.exports = { execute };