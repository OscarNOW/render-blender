const fs = require('fs');
const path = require('path');

const { code } = require('../secret.json');

module.exports = {
    execute({ end, params, statusCode }) {
        if (params.code !== code) return statusCode(403, 'wrongCode', 'Wrong code');

        const id = params.id;

        if ((!id) && id !== 0) return statusCode(403, 'invalidId', 'Invalid id');
        if (!fs.existsSync(path.join(__dirname, `../../worker/output/render/${id}/`))) return statusCode(403, 'invalidId', 'Invalid id');

        const files = fs.readdirSync(path.join(__dirname, `../../worker/output/render/${id}/`)).sort((a, b) => b.localeCompare(a));
        if (files.length < 2) return statusCode(404, 'noFrames', 'The file does not have any frames');

        end(files[1].split('.png')[0]);
    }
}