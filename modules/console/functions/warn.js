const fs = require('fs');
const settings = require('../settings.json')

module.exports = {
    execute(text) {
        if (!text) text = "";

        let cConsole = fs.readFileSync(`.${settings.path.files.console}`);
        cConsole = `${cConsole}${text}\n`;
        fs.writeFileSync(`.${settings.path.files.console}`, cConsole);

        console.warn(text);
    }
}