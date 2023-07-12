const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const { code } = require('../secret.json');
const { basePath } = require('../settings.json');

module.exports = {
    execute({ end, params, statusCode }) {
        if (params.code !== code) return statusCode(403, 'Wrong code');

        if (!fs.existsSync('/user/')) fs.mkdirSync('/user/');
        if (!fs.existsSync('/user/files/')) fs.mkdirSync('user/files/');

        const filePath = path.join(basePath, params.filePath);

        if (!filePath.startsWith(basePath)) return statusCode(403, 'Invalid file path');
        if (!fs.existsSync(filePath)) return statusCode(403, 'Invalid file path');

        const newBaseFilePath = path.join(__dirname, '../../worker/render/');
        const newFilePath = path.join(newBaseFilePath, params.filePath);

        if (!newFilePath.startsWith(newBaseFilePath)) return statusCode(403, 'Invalid file path');

        fs.copyFileSync(filePath, newFilePath);
        spawn('cmd.exe', ['/c', '../../worker/index.bat']);

        end();
    }
}