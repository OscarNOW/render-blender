const { getModerationPostIds } = require('./getPost.js');
const { get, set } = require('../../modules/database/functions/database.js');

module.exports = {
    async execute({ parseError, statusCode, end, middlewareData: { hasPermission }, params }) {
        try {

            // Check visibility parameter
            if (!params.visibility) return statusCode(400, 'noVisibilityProvided', 'No visibility provided');
            if (!['verified', 'flagged', 'hidden'].includes(params.visibility)) return statusCode(400, 'invalidVisibility', 'Invalid visibility provided');

            // Check moderationPost parameter
            if (!params.moderationPost) return statusCode(400, 'noModerationPostProvided', 'No moderationPost provided');
            const moderationPostIds = getModerationPostIds();
            if (!moderationPostIds[params.moderationPost]) return statusCode(400, 'invalidModerationPost', 'Invalid moderationPost provided');

            // check permission
            hasPermission = await hasPermission;
            if (!hasPermission(['moderate', 'updatePostVisibility', params.visibility]))
                return statusCode(403, 'invalidPermission', `Invalid permission to update post visibility (moderate.updatePostVisibility.${params.visibility})`);

            // Get post
            const [community, postId] = moderationPostIds[params.moderationPost];
            const db = await get();
            const post = db.communities[community].posts[postId];

            // Update post properties
            post.visibility = params.visibility;
            post.visibilityAuthor = 'manual';

            // Finish
            await set(db);
            end();


        } catch (e) {
            parseError(e)
        }
    }
}