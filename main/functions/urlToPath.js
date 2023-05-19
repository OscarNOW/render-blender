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

        const publicPath = pathLib.resolve(__dirname, `../../publicFiles${localPath}`);
        const privatePath = pathLib.resolve(__dirname, `../../privateFiles${localPath}`);

        return {
            publicPath,
            privatePath,
            localPath
        };
    }
}