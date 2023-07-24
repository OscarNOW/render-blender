const fs = require('fs');
const path = require('path');

const { code } = require('../secret.json');

module.exports = {
    execute({ end, params, statusCode }) {
        if (params.code !== code) return statusCode(403, 'wrongCode', 'Wrong code');
        const ids = [];

        if (fs.existsSync(path.join(__dirname, '../../worker/stages/')))
            for (const checkStage of fs.readdirSync(path.join(__dirname, '../../worker/stages/')))
                for (const id of fs.readdirSync(path.join(__dirname, `../../worker/stages/${checkStage}/`)))
                    ids.push(id);

        end(JSON.stringify(ids));
    }
}