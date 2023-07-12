const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const { code } = require('../secret.json');
const { basePath } = require('../settings.json');

module.exports = {
    execute({ end, params, statusCode }) {
        if (params.code !== code) return statusCode(403, 'wrongCode', 'Wrong code');

        if (!fs.existsSync('/user/')) fs.mkdirSync('/user/');
        if (!fs.existsSync('/user/files/')) fs.mkdirSync('user/files/');

        const filePath = path.join(basePath, params.filePath);

        if (!filePath.startsWith(basePath)) return statusCode(403, 'invalidFilePath', 'Invalid file path');
        if (!fs.existsSync(filePath)) return statusCode(403, 'invalidFilePath', 'Invalid file path');

        const id = Math.floor(Math.random() * 10000);
        const fileName = `${id}.blend`;

        const newBaseFilePath = path.join(__dirname, '../../worker/render/');
        const newFilePath = path.join(newBaseFilePath, fileName);

        if (!newFilePath.startsWith(newBaseFilePath)) return statusCode(403, 'invalidFilePath', 'Invalid file path');

        fs.copyFileSync(filePath, newFilePath);
        render(fileName);

        end(`${id}`);
    }
}

function render(fileName) {
    const process = spawn(`"${path.join(__dirname, '../../worker/launchRender.bat')}"`, [fileName], { shell: true, cwd: path.join(__dirname, '../../worker/') });

    process.stdout.on('data', (data) => {
        console.log(data.toString());
    });

    process.stderr.on('data', (data) => {
        console.error(data.toString());
    });

    process.on('exit', (code) => {
        if (code !== 0)
            console.log(`Child exited with code ${code}`);
    });
}