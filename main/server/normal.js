const fs = require('fs');
const mime = require('mime-types');
const statusCode = require('../functions/error/statusCode.js').execute;
const checkAcceptHeader = require('../functions/parse/header/accept');

module.exports = {
    execute(request, response) {

        let path = require('../functions/parse/normal').execute(request.url.toLowerCase());

        if (fs.existsSync(path))
            fs.readFile(path, async (err, data) => {
                if (err) throw err;

                response.writeHead(200, { 'Content-Type': mime.lookup(path) });
                return response.end(data);
            });
        else
            if (request.headers.accept && !checkAcceptHeader(request.headers.accept, 'text/html').isIn) {
                response.writeHead(404);
                return response.end();
            }
            else
                statusCode(response, 404);
    }
};