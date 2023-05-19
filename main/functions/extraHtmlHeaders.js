const fs = require('fs');
const pathLib = require('path');

module.exports = ({ data }) => {
    const headers = {};

    let loadedFiles = [];
    let scriptIndex = data.indexOf('<script type="module" src="');
    while (scriptIndex !== -1) {

        const scriptEndIndex = data.indexOf('"', scriptIndex + '<script type="module" src="'.length);
        const scriptPath = data.slice(scriptIndex, scriptEndIndex + 9).split('<script type="module" src="')[1].split('"')[0].trim();

        loadedFiles.push({ path: scriptPath });

        scriptIndex = data.indexOf('<script type="module" src="', scriptEndIndex);

    }

    // add all preloadPublicFiles to loadedFiles
    let changed = true;
    while (changed) {
        changed = false;
        for (const loadedFile of loadedFiles) {
            const { fileRequirements, type, fetchPriority } = getPublicFilePreloadInfo(loadedFile.path);

            if (!loadedFile.type) {
                loadedFile.type = type;
                changed = true;
            }

            if (fetchPriority === 'defer') {
                loadedFiles = loadedFiles.filter(({ path }) => path !== loadedFile.path);
                changed = true;
                break;
            }

            if ((![null, undefined].includes(loadedFile.fallbackFetchPriority)) && [null, undefined].includes(fetchPriority)) {
                loadedFile.fetchPriority = loadedFile.fallbackFetchPriority;
                delete loadedFile.fallbackFetchPriority;
                changed = true;
            }

            if (loadedFile.fetchPriority === undefined) {
                loadedFile.fetchPriority = fetchPriority;
                changed = true;
            }

            for (const preloadPublicFile of fileRequirements)
                if (!loadedFiles.find(({ path }) => path === preloadPublicFile)) {
                    loadedFiles.push({ path: preloadPublicFile, fallbackFetchPriority: loadedFile.fetchPriority });
                    changed = true;
                } else if (
                    ![null, undefined].includes(loadedFile.fetchPriority) && (
                        [null, undefined].includes(loadedFiles.find(({ path }) => path === preloadPublicFile).fetchPriority) ||
                        (loadedFiles.find(({ path }) => path === preloadPublicFile).fetchPriority === 'low' && loadedFile.fetchPriority === 'high')
                    )
                ) {
                    loadedFiles.find(({ path }) => path === preloadPublicFile).fetchPriority = loadedFile.fetchPriority;
                    changed = true;
                }
        }
    };

    for (const loadedFile of loadedFiles)
        if (loadedFile.fallbackFetchPriority !== undefined)
            delete loadedFile.fallbackFetchPriority

    loadedFiles = loadedFiles.sort((a, b) => {
        if (a.fetchPriority === 'high' && b.fetchPriority !== 'high') return -1;
        if (a.fetchPriority !== 'high' && b.fetchPriority === 'high') return 1;

        if (a.fetchPriority === 'low' && b.fetchPriority !== 'low') return 1;
        if (a.fetchPriority !== 'low' && b.fetchPriority === 'low') return -1;

        return 0;
    });

    const links = [];
    for (const { path, type, fetchPriority } of loadedFiles)
        links.push(`<${path}>; rel=${type === 'script' ? 'modulepreload' : 'preload'}; as=${type}${fetchPriority ? `; fetchpriority=${fetchPriority}` : ''}`);

    if (links.length > 0)
        headers['Link'] = links.join(', ');

    return headers;
}

function getPublicFilePreloadInfo(path) {
    const file = fs.existsSync(pathLib.resolve(__dirname, `../../publicFiles${path}`)) ?
        fs.readFileSync(pathLib.resolve(__dirname, `../../publicFiles${path}`)).toString() :
        '';

    const fileRequirements = getFileRequirements(file);
    const fetchPriority = getFetchpriority(file)

    let type;
    if (path.endsWith('.js'))
        type = 'script';
    else if (path.endsWith('.css'))
        type = 'style';
    else if (path.startsWith('/api/'))
        type = 'fetch';
    else
        throw new Error(`Unknown type for file: "${path}"`)

    return { fileRequirements, type, fetchPriority };
}

function getFileRequirements(file) {
    if (!(file.includes('--fileRequirements--') && file.includes('--endFileRequirements--'))) return [];
    file = file.split('\n');

    return file
        .slice(
            file.findIndex((a) => a.includes('--fileRequirements--')) + 1,
            file.findIndex((a) => a.includes('--endFileRequirements--'))
        )
        .map((a) => a.trim())
        .filter((a) => a !== '')
}

function getFetchpriority(file) {
    if (!file.includes('--fetchPriority--: ')) return null;
    return file.split('\n').find((a) => a.includes('--fetchPriority--: ')).split(':').slice(1).join(':').trim() || null;
}