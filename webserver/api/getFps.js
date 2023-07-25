const fs = require('fs');
const path = require('path');

const { code } = require('../secret.json');

module.exports = {
    execute({ end, params, statusCode }) {
        if (params.code !== code) return statusCode(403, 'wrongCode', 'The code provided is not the correct one');

        const id = params.id;
        if ((!id) && id !== 0) return statusCode(403, 'invalidId', 'Invalid id');

        const baseFilePath = path.join(__dirname, '../../worker/output/analyse/');
        const filePath = path.join(__dirname, baseFilePath, `/${id}/`, 'framerate.txt'); //todo: test if the / before ${id} is needed

        if (!filePath.startsWith(baseFilePath)) return statusCode(403, 'invalidId', 'Invalid id');
        if (!fs.existsSync(filePath)) return statusCode(403, 'invalidId', 'Invalid id');

        end(fs.readFileSync(filePath));
    }
}