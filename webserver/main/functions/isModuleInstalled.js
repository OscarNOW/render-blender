const fs = require('fs');
const settings = require('../../settings.json');

module.exports = {
    execute(name) {
        return fs.existsSync(`${settings.generic.path.files.modules}${name}/`);
    }
}