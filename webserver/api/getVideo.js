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

        response.writeHead(200, {
            'Content-Type': 'video/mp4',
            'Access-Control-Allow-Origin': '*'
        });
        fs.createReadStream(filePath).pipe(response);
    }
}