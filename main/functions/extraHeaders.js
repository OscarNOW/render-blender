const { cache: { publicFiles, privateFiles } } = require('../../settings.json');

module.exports = (isPrivate) => {
    const headers = {};

    if (isPrivate) {
        headers['Cache-Control'] = `private, max-age=${privateFiles.cacheMinutes * 60}, stale-while-revalidate=${privateFiles.staleUseMinutes * 60}, stale-if-error=${privateFiles.errorUseMinutes * 60}`;
        headers['Vary'] = 'Cookie';
    } else
        headers['Cache-Control'] = `public, max-age=${publicFiles.cacheMinutes * 60}, stale-while-revalidate=${publicFiles.staleUseMinutes * 60}, stale-if-error=${publicFiles.errorUseMinutes * 60}`

    return headers;
}