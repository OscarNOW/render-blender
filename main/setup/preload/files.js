const fs = require('fs');
const mime = require('mime-types');

const cConsole = require('../../../modules/console/functions/get.js');
const serverSideRenderHtml = require('../../functions/serverSideRenderHtml/serverSideRenderHtml.js');
const getExtraHeaders = require('../../functions/extraHeaders.js');
const getExtraHtmlHeaders = require('../../functions/extraHtmlHeaders.js');

const files = {};

//todo: move to separate file
const textFiles = [
    'html',
    'css',
    'js',
    'json',
    'txt',
    'md',
    'svg'
];

addFiles('/', './files/')

module.exports = files;

function addFiles(websitePath, path) {
    cConsole.log(`Preloading public files from ${path}`)

    if (fs.existsSync(path))
        for (const name of fs.readdirSync(path)) {
            if (fs.statSync(path + name).isFile()) {
                let pathname = websitePath;
                if (name !== 'index.html') pathname += name;
                if (pathname.endsWith('/')) pathname = pathname.slice(0, -1);

                files[pathname] = getPublicFile(path + name);
            } else
                addFiles(websitePath + name + '/', path + name + '/');
        }
}

function getPublicFile(path) {
    const contentType = mime.lookup(path);

    if (contentType === 'text/html') {
        const data = fs.readFileSync(path).toString()

        const finalData = serverSideRenderHtml(data, false);
        const extraHeaders = getExtraHeaders(false);
        const extraHtmlHeaders = getExtraHtmlHeaders({ data });

        return {
            statusCode: 200,
            headers: {
                ...extraHeaders,
                ...extraHtmlHeaders,
                'Content-Type': contentType + '; charset=UTF-8',
                'Content-Length': Buffer.byteLength(finalData)
            },
            data: finalData
        }
    } else if (textFiles.some((ext) => path.endsWith(ext))) {
        const data = fs.readFileSync(path).toString();

        const extraHeaders = getExtraHeaders(false);

        return {
            statusCode: 200,
            headers: {
                ...extraHeaders,
                'Content-Type': contentType + '; charset=UTF-8',
                'Content-Length': Buffer.byteLength(data)
            },
            data
        };
    } else {
        const size = fs.statSync(path).size;

        const extraHeaders = getExtraHeaders(false);

        return {
            statusCode: 200,
            headers: {
                ...extraHeaders,
                'Content-Type': contentType,
                'Content-Length': size
            },
            data: null,
            path
        }
    }
}