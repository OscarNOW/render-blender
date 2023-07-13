const fs = require('fs');
const path = require('path');

const { code } = require('../secret.json');

module.exports = {
    execute({ response, params, statusCode }) {
        if (params.code !== code) return statusCode(403, 'wrongCode', 'Wrong code');

        const id = params.id;

        if ((!id) && id !== 0) return statusCode(403, 'invalidId', 'Invalid id');
        if (!fs.existsSync(path.join(__dirname, `../../worker/output/${id}/`))) return statusCode(403, 'invalidId', 'Invalid id');

        const files = fs.readdirSync(path.join(__dirname, `../../worker/output/${id}/`)).sort((a, b) => b.localeCompare(a));
        if (files.length === 0) return statusCode(404, 'noFrames', 'The file does not have any frames');

        const filePath = path.join(__dirname, `../../worker/output/${id}/`, files[0]);

        response.writeHead(200, { 'Content-Type': 'image/png' });
        fs.createReadStream(filePath).pipe(response);
    }
}