const fs = require('fs');
const path = require('path');

const statusCode = require('../functions/error/statusCode.js').execute;

if (!fs.existsSync(path.join(__dirname, '../../secret.json'))) throw new Error('No secret.json present');
const { code } = require('../../secret.json');

function execute(request, response, { extraData: { body } }) {
    const urlSearchParams = new URLSearchParams(request.url.split('?')[1]);

    if (urlSearchParams.get('code') !== code) return statusCode({ request, response, code: 403, text: 'Wrong code' });
    if (!urlSearchParams.get('fileName')) return statusCode({ request, response, code: 403, text: 'No fileName provided' });

    if (!fs.existsSync('/user/')) fs.mkdirSync('/user/');
    if (!fs.existsSync('/user/files/')) fs.mkdirSync('/user/files/');

    const baseFilePath = path.join(__dirname, '../../user/files/');
    const filePath = path.join(baseFilePath, urlSearchParams.get('fileName'));

    if (!filePath.startsWith(baseFilePath)) return statusCode({ request, response, code: 403, text: 'Invalid file path' });

    fs.writeFileSync(filePath, body);
    console.log('Upload successful')
}

module.exports = { execute };