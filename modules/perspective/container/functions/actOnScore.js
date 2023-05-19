const minimalScores = require('../../../../settings.json').minimalScores;
const { get, set } = require('../../../database/functions/database.js');

module.exports = async (community, postId) => {
    const db = await get();
    const post = db.communities?.[community]?.posts?.[postId];

    if (!post)
        return console.log('[PERSPECTIVE actOnScore] POST NOT FOUND IN DATABASE', community, postId);

    const toxicScore = post.perspective.attributes.TOXICITY;

    if (toxicScore > minimalScores.postHidden)
        post.visibility = 'hidden';
    else if (toxicScore > minimalScores.postFlagged)
        post.visibility = 'flagged';
    else
        post.visibility = 'verified';

    post.visibilityAuthor = 'automatic';

    await set(db);
}