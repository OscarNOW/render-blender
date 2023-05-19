const { get } = require('./database.js');

module.exports = async (amount) => {
    const db = await get();
    const posts = [];

    for (const community in db.communities) {
        if (posts.length >= amount) break;

        for (const postId in db.communities[community].posts) {
            if (posts.length >= amount) break;

            const post = db.communities[community].posts[postId];

            if (post.visibilityAuthor === 'automatic' && ['flagged', 'hidden'].includes(post.visibility))
                posts.push([community, postId]);
        }
    }

    return posts;
}