const readdir = require('util').promisify(require('fs').readdir);

const settings = require('../../../settings.json');
let messages;

let cConsole;
try {
    cConsole = require('../../../modules/console/functions/get.js');
} catch {
    cConsole = console;
}

module.exports = {
    async execute() {
        if (!messages)
            try {
                messages = (await require('../get/messages.js').execute()).messages
            } catch { }

        cConsole.clear();
        cConsole.log(`${messages?.general?.ListeningOnPort || 'unable to get message'} ${settings.generic.port}`);

        try {
            const files =
                (await readdir(settings.generic.path.files.errors))
                    .filter((val) => val !== settings.generic.path.files.noError);

            if (files[0]) {
                cConsole.clear();
                cConsole.log(`${messages?.general?.ListeningOnPort || 'unable to get message'} ${settings.generic.port}`);
                cConsole.log();
                cConsole.log();

                let message = messages?.error?.thereAreErrors?.replace?.('{amount}', files.length);
                if (files.length === 1) message = messages?.error?.thereIsError?.replace?.('{amount}', files.length);
                if (!message) message = 'unable to get message'

                cConsole.warn(message);
                files.forEach((val) => {
                    let occurrences;
                    try {
                        occurrences = require(`../../../${settings.generic.path.files.errors}${val}`).occurrences.length;
                    } catch {
                        occurrences = -1;
                    }
                    cConsole.warn(`${settings.generic.path.files.errors}${val}\t\t${occurrences}`);
                });

                cConsole.log();
            }
        } catch (error) {
            await require('./lastFallback.js').execute({ error });
        }
    }
}