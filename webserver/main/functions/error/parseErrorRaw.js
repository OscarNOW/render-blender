const fs = require('fs');
const readdirSync = fs.readdirSync;
const writeFileSync = fs.writeFileSync;
const settings = require('../../../settings.json');

module.exports = {
    async execute(error, customText) {
        try {
            let errorMessage = error.stack;
            if (errorMessage === undefined) {
                if (`${error}`) {
                    errorMessage = new Error(`${error}`).stack;
                } else {
                    error = new Error('Error message is undefined');
                    errorMessage = error.stack;
                }
            }

            let fileIsSpecial = true;
            let sameFile;

            const files = readdirSync(settings.generic.path.files.errors);

            files.forEach((file) => {
                if (file === settings.generic.path.files.noError) return;

                let data;
                try {
                    data = require(`../../.${settings.generic.path.files.errors}${file}`);
                } catch { }

                if (data && (data.errorMessage.split(': ')[1] === errorMessage.split('\n')[0].split(': ')[1])) {
                    fileIsSpecial = false;
                    sameFile = file;
                }
            });

            if (fileIsSpecial) {
                const date = new Date().getTime();
                const fileName = `${Math.floor(Math.random() * 100000000)}.json`;
                const path = `${settings.generic.path.files.errors}${fileName}`;
                const obj = {
                    errorMessage: errorMessage.split('\n')[0],
                    occurrences: [
                        {
                            time: date,
                            stack: errorMessage.split('\n')
                        }
                    ]
                };

                const easyAccessPath = createEasyAccessPath(errorMessage);
                if (easyAccessPath) obj.occurrences[0].easyAccessPath = easyAccessPath;

                if (customText) obj.occurrences[0].customText = customText;
                writeFileSync(path, JSON.stringify(obj, null, 4));
                return `${fileName}`;
            } else {
                const date = new Date().getTime();
                const requirePath = `../../.${settings.generic.path.files.errors}${sameFile}`;
                const fsPath = `${settings.generic.path.files.errors}${sameFile}`;
                const oldObj = require(requirePath);

                const obj = {
                    time: date,
                    stack: errorMessage.split('\n')
                };

                const easyAccessPath = createEasyAccessPath(errorMessage);
                if (easyAccessPath) obj.easyAccessPath = easyAccessPath;

                if (customText) obj.customText = customText;
                oldObj.occurrences.push(obj);
                writeFileSync(fsPath, JSON.stringify(oldObj, null, 4));
                return sameFile;
            }
        } catch (error) {
            await require('./lastFallback.js').execute({ error })
        }
    }
}

function createEasyAccessPath(errorMessage) {
    try {
        const easyAccessPath = errorMessage.split('\n')
            .filter((line) => line.trim().startsWith('at'))
            .filter((line) => !line.includes('internal'))
            .filter((line) => !line.includes('node:'))
            .filter((line) => !line.includes('node_modules'))[0]
            ?.split?.('(')?.[1]
            ?.split?.(')')?.[0]

        return easyAccessPath;
    } catch { }
}