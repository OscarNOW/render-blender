const fs = require('fs');
const settings = require('../settings.json');

module.exports = () => {
    fs.writeFileSync(`.${settings.path.files.console}`, '');
    console.clear();
}