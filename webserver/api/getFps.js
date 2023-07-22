const fs = require('fs');
const path = require('path');

const { code } = require('../secret.json');

module.exports = {
    execute({ end, params, statusCode }) {
        if (params.code !== code) return statusCode(403, 'wrongCode', 'Wrong code');

        const id = params.id;

        if ((!id) && id !== 0) return statusCode(403, 'invalidId', 'Invalid id');
        if (!fs.existsSync(path.join(__dirname, `../../worker/output/analyse/${id}/`))) return statusCode(403, 'invalidId', 'Invalid id');

        const baseFilePath = path.join(__dirname, '../../worker/output/analyse/');
        const filePath = path.join(__dirname, baseFilePath, `/${id}/`, 'framerate.txt');

        if (!filePath.startsWith(baseFilePath)) return statusCode(403, 'invalidId', 'Invalid id');
        if (!fs.existsSync(filePath)) return statusCode(403, 'invalidId', 'Invalid id');

        end(fs.readFileSync(filePath));
    }
}