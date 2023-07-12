const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const { code } = require('../secret.json');
const { basePath, blenderPath } = require('../settings.json');

module.exports = {
    execute({ end, params, statusCode }) {
        if (params.code !== code) return statusCode(403, 'wrongCode', 'Wrong code');

        if (!fs.existsSync('/user/')) fs.mkdirSync('/user/');
        if (!fs.existsSync('/user/files/')) fs.mkdirSync('user/files/');

        const filePath = path.join(basePath, params.filePath);

        if (!filePath.startsWith(basePath)) return statusCode(403, 'invalidFilePath', 'Invalid file path');
        if (!fs.existsSync(filePath)) return statusCode(403, 'invalidFilePath', 'Invalid file path');

        const id = Math.floor(Math.random() * 10000);

        render(id, filePath);
        end(`${id}`);
    }
}

function render(id, filePath) {
    const process = spawn(`"${path.join(__dirname, '../../worker/launchRender.bat')}"`, [id, filePath, blenderPath], { shell: true, cwd: path.join(__dirname, '../../worker/') });

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