const fs = require('fs');
const path = require('path');

const { code } = require('../secret.json');

module.exports = {
    execute({ response, params, statusCode }) {
        if (params.code !== code) return statusCode(403, 'wrongCode', 'The code provided is not the correct one');

        const id = params.id;
        if ((!id) && id !== 0) return statusCode(403, 'invalidId', 'Invalid id');

        //todo-imp: do baseFilePath check
        throw new Error('todo')

        const files = fs.readdirSync(path.join(__dirname, `../../worker/output/render/${id}/`)).sort((a, b) => b.localeCompare(a));
        if (files.length < 2) return statusCode(404, 'noFrames', 'The file does not have any frames');

        const filePath = path.join(__dirname, `../../worker/output/render/${id}/`, files[1]);

        response.writeHead(200, {
            'Content-Type': 'image/png',
            'Access-Control-Allow-Origin': '*'
        });
        fs.createReadStream(filePath).pipe(response);
    }
}