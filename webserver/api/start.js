const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const { code } = require('../secret.json');
const { blenderPath } = require('../settings.json');

module.exports = {
    execute({ end, params, statusCode }) {
        if (params.code !== code) return statusCode(403, 'wrongCode', 'The code provided is not the correct one');

        const id = params.id;
        if ((!id) && id !== 0) return statusCode(403, 'invalidId', 'Invalid id');

        const filePath = getFilePath(id);
        if (!filePath) return statusCode(403, 'invalidId', 'Invalid id');

        start(id, filePath);
        end(`${id}`);
    }
}

function getFilePath(id) {
    if (fs.existsSync(path.join(__dirname, '../../worker/stages/')))
        for (const checkStage of fs.readdirSync(path.join(__dirname, '../../worker/stages/')))
            for (const checkId of fs.readdirSync(path.join(__dirname, `../../worker/stages/${checkStage}/`)))
                if (checkId === id)
                    return fs.readFileSync(path.join(__dirname, `../../worker/stages/${checkStage}/${checkId}`)).toString().slice(1, -1);

    return null;
}

function start(id, filePath) {
    const process = spawn(`"${path.join(__dirname, '../../worker/launchStart.bat')}"`, [id, `"${filePath}"`, `"${blenderPath}"`], { shell: true, cwd: path.join(__dirname, '../../worker/') });

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