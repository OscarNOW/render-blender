const fs = require('fs');
const path = require('path');

const inlineCssStartString = '<!-- inlineCss: ';
const inlineCssEndString = ' -->';

const cssDeferLoadUrls = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css',
    'https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css',
    'https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css'
];

const noscriptMessage = fs.readFileSync(path.resolve(__dirname, './noscriptMessage.html')).toString();

module.exports = (html, isPrivate) => {

    if (isPrivate)
        html += '<script>window.privateFile = true;</script>';

    html = html.replaceAll('<link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet" />', `
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" fetchpriority="low" rel="preload" as="style" onload="this.onload=null;this.rel='stylesheet'">
        <noscript><link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" fetchpriority="low" rel="stylesheet"></noscript>
    `);

    for (const url of cssDeferLoadUrls)
        html = html.replaceAll(`<link href="${url}" rel="stylesheet" />`, `
            <link href="${url}" fetchpriority="low" rel="preload" as="style" onload="this.onload=null;this.rel='stylesheet'">
            <noscript><link href="${url}" fetchpriority="low" rel="stylesheet"></noscript>
        `)

    let inlineCssIndex = html.indexOf(inlineCssStartString);
    while (inlineCssIndex !== -1) {
        const endIndex = html.indexOf(inlineCssEndString, inlineCssIndex);

        const cssPath = html.substring(inlineCssIndex + inlineCssStartString.length, endIndex);
        const parsedCssPath = path.resolve(`.${cssPath}`);
        if (![path.resolve(__dirname, '../../../publicFiles/'), path.resolve(__dirname, '../../../privateFiles/')].some((p) => parsedCssPath.startsWith(p))) {
            inlineCssIndex = html.indexOf(inlineCssStartString, inlineCssIndex + 1);
            continue;
        }

        const css = fs.readFileSync(parsedCssPath).toString();
        const injection = `<style>${css}</style>`;
        const oldValue = inlineCssStartString + cssPath + inlineCssEndString;

        html = html.substring(0, inlineCssIndex) + injection + html.substring(inlineCssIndex + oldValue.length + inlineCssEndString.length);

        inlineCssIndex = html.indexOf(inlineCssStartString, inlineCssIndex + 1);
    }

    html = html.replace('</head>', `${noscriptMessage}</head>`);

    return html;
}