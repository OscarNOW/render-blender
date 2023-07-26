const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const { code } = require('../secret.json');

module.exports = {
    execute({ end, params, statusCode }) {
        if (params.code !== code) return statusCode(403, 'wrongCode', 'The code provided is not the correct one');

        const id = params.id;
        if ((!id) && id !== 0) return statusCode(403, 'invalidId', 'Invalid id');

        const baseFilePath = path.join(__dirname, '../../worker/output/analyse/');
        const filePath = path.join(baseFilePath, `/${id}/`, 'lastFrame.txt');

        if (!filePath.startsWith(baseFilePath)) return statusCode(403, 'invalidId', 'Invalid id');
        if (!fs.existsSync(filePath)) return statusCode(403, 'invalidId', 'Invalid id');

        stop(id);
        end();
    }
}

function stop(id) {
    const process = spawn(`"${path.join(__dirname, '../../worker/stop.bat')}"`, [id], { shell: true, cwd: path.join(__dirname, '../../worker/') });

    process.stdout.on('data', (data) => {
        console.log(data.toString());
    });

    process.stderr.on('data', (data) => {
        console.warn(data.toString());
    });

    process.on('exit', (code) => {
        if (code !== 0)
            console.log(`Child exited with code ${code}`);
    });
}