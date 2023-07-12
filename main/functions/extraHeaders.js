const { cache: { files } } = require('../../settings.json');

module.exports = () => ({
    'Cache-Control': `public, max-age=${files.cacheMinutes * 60}, stale-while-revalidate=${files.staleUseMinutes * 60}, stale-if-error=${files.errorUseMinutes * 60}`
})