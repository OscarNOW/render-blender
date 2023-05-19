const getModerationPosts = require('../../modules/database/functions/getModerationPosts.js');
const { get } = require('../../modules/database/functions/database.js');
const moderationPostIds = {};

module.exports = {
    async execute({ parseError, statusCode, end, middlewareData: { hasPermission } }) {
        try {

            hasPermission = await hasPermission;
            if (!hasPermission('moderate.getPost'))
                return statusCode(403, 'invalidPermission', 'Invalid permission to get post (moderate.getPost)');

            const posts = await getModerationPosts(10);
            const [community, postId] = posts[Math.floor(Math.random() * posts.length)];

            const moderationPostId = Math.random().toString(36).substr(2, 9);
            moderationPostIds[moderationPostId] = [community, postId];

            const post = (await get()).communities[community].posts[postId];

            end(JSON.stringify({
                id: moderationPostId,
                visibility: post.visibility,
                visibilityAuthor: post.visibilityAuthor,
                content: post.content,
                perspective: post.perspective
            }));

        } catch (e) {
            parseError(e)
        }
    },
    getModerationPostIds() {
        return moderationPostIds;
    }
}