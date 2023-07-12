const url = require('url');
const pathLib = require('path');

module.exports = {
    execute(p) {
        let localPath = url.parse(p).pathname;

        if (!localPath.split('/').at(-1).includes('.')) {
            if (!localPath.endsWith('/'))
                localPath = `${localPath}/`;

            localPath = `${localPath}index.html`;
        };

        const path = pathLib.resolve(__dirname, `../../files${localPath}`);

        return {
            path,
            localPath
        };
    }
}