const readdir = require('fs').readdir
const settings = require('../../../settings.json');
const messages = require('../get/messages').execute().mainFunction();
const isModuleInstalled = require('../isModuleInstalled').execute;

let cConsole = console;
if (require('../../functions/isModuleInstalled').execute('console')) {
    cConsole = {
        clear: require(`../../.${settings.generic.path.files.modules}console/functions/clear`).execute,
        log: require(`../../.${settings.generic.path.files.modules}console/functions/log`).execute,
        warn: require(`../../.${settings.generic.path.files.modules}console/functions/warn`).execute
    }
}

module.exports = {
    execute() {
        cConsole.clear();

        readdir(settings.generic.path.files.errors, (err, fi) => {
            try {
                if (err) throw err;

                let files = [];
                fi.forEach(val => {
                    if (val == settings.generic.path.files.noError) return;
                    files.push(val);
                })

                if (files[0]) {
                    cConsole.clear();
                    let message = messages.error.thereAreErrors.replace('{amount}', files.length);
                    if (files.length == 1) message = messages.error.thereIsError.replace('{amount}', files.length);

                    cConsole.warn(message);
                    cConsole.log();
                    if (isModuleInstalled('text')) {
                        let rows = [];
                        files.forEach((val) => {
                            if (val.endsWith('.json')) {
                                let occurrences = require(`../../../${settings.generic.path.files.errors}${val}`).occurrences.length;
                                rows.push([`${settings.generic.path.files.errors}${val}`, occurrences]);
                            } else
                                rows.push([`${settings.generic.path.files.errors}${val}`, -1])
                        });

                        let createDiagram = require(`../../../${settings.generic.path.files.modules}text/createDiagram.js`);
                        let diagram = createDiagram.twoColumns(rows, 4, ' ');

                        diagram.forEach((val) => {
                            cConsole.warn(val);
                        });
                    } else
                        files.forEach((val) => {
                            let occurrences = require(`../../../${settings.generic.path.files.errors}${val}`).occurrences.length;
                            cConsole.warn(`${settings.generic.path.files.errors}${val}\t\t${occurrences}`);
                        });

                    cConsole.log();
                    cConsole.warn(message);
                }
            } catch (err) {
                require('./lastFallback').execute(err);
            }
        });
    }
}