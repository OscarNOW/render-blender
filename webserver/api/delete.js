const fs = require('fs');
const path = require('path');

const { code } = require('../secret.json');

module.exports = {
    execute({ end, params, statusCode }) {
        if (params.code !== code) return statusCode(403, 'wrongCode', 'Wrong code');

        const id = params.id;
        if ((!id) && id !== 0) return statusCode(403, 'invalidId', 'Invalid id');

        if (fs.existsSync(path.join(__dirname, '../../worker/stages/')))
            for (const checkStage of fs.readdirSync(path.join(__dirname, '../../worker/stages/')))
                for (const checkId of fs.readdirSync(path.join(__dirname, `../../worker/stages/${checkStage}/`)))
                    if (checkId === id)
                        fs.rmSync(path.join(__dirname, `../../worker/stages/${checkStage}/${id}/`));

        if (fs.existsSync(path.join(__dirname, '../../worker/output/')))
            for (const checkStage of fs.readdirSync(path.join(__dirname, '../../worker/output/')))
                for (const checkName of fs.readdirSync(path.join(__dirname, `../../worker/output/${checkStage}/`)))
                    if (checkName.split('.')[0] === id)
                        fs.rmSync(path.join(__dirname, `../../worker/output/${checkStage}/${checkName}`), { recursive: true });

        end();
    }
}