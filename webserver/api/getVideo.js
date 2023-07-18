const fs = require('fs');
const path = require('path');

const { code } = require('../secret.json');

module.exports = {
    execute({ response, params, statusCode }) {
        if (params.code !== code) return statusCode(403, 'wrongCode', 'Wrong code');

        const id = params.id;
        if ((!id) && id !== 0) return statusCode(403, 'invalidId', 'Invalid id');

        const filePath = path.join(__dirname, `../../worker/output/video/${id}.mp4`);
        if (!fs.existsSync(filePath)) return statusCode(403, 'invalidId', 'Invalid id');

        response.writeHead(200, {
            'Content-Type': 'video/mp4',
            'Access-Control-Allow-Origin': '*'
        });
        fs.createReadStream(filePath).pipe(response);
    }
}