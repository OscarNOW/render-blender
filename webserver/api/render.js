const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const { code } = require('../secret.json');

module.exports = {
    execute({ end, params, statusCode }) {
        if (params.code !== code) return statusCode(403, 'Wrong code');

        if (!fs.existsSync('/user/')) fs.mkdirSync('/user/');
        if (!fs.existsSync('/user/files/')) fs.mkdirSync('user/files/');

        const baseFilePath = path.join(__dirname, '../../user/files/');
        const filePath = path.join(baseFilePath, params.fileName);

        if (!filePath.startsWith(baseFilePath)) return statusCode(403, 'Invalid file name');
        if (!fs.existsSync(filePath)) return statusCode(403, 'Invalid file name');

        const newBaseFilePath = path.join(__dirname, '../../worker/render/');
        const newFilePath = path.join(newBaseFilePath, params.fileName);

        if (!newFilePath.startsWith(newBaseFilePath)) return statusCode(403, 'Invalid file name');

        fs.copyFileSync(filePath, newFilePath);
        spawn('cmd.exe', ['/c', '../../worker/index.bat']);

        end();
    }
}