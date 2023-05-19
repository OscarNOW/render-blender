const { get, set } = require('../../modules/database/functions/database.js');
const parseErrorOnline = require('../functions/error/parseErrorOnline.js').execute;
const addPostToQueue = require('../../modules/perspective/functions/addPostToQueue.js');

const statusCode = (response, code, { text, short }) => {
    response.writeHead(code, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({
        successful: `${code}`.startsWith('2'),
        code,
        text,
        short
    }));
}

module.exports = {
    async execute(request, response, { middlewareData }) {
        const parseError = async (error, text) => await parseErrorOnline({ error, request, response, text });

        try {
            const { path, params, success } = require('../functions/parse/dbApiCall.js').execute(request);
            let { authentication: a, explicitlyAuthenticated, hasPermission } = middlewareData;

            a = await a;
            explicitlyAuthenticated = await explicitlyAuthenticated;
            hasPermission = await hasPermission;

            let authentication = a;
            if (!explicitlyAuthenticated)
                authentication = null;

            if (!success) {
                statusCode(response, 400, { text: 'Invalid request', short: 'invalidRequest' });
                return;
            }

            const db = await get();

            doApiCall({
                db,
                set: () => set(db),
                path,
                params,
                method: request.method,
                userId: authentication?.uid,
                end: (json) => {
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify(json));
                },
                statusCode: (code, { text, short }) => statusCode(response, code, { text, short }),
                require: ({ name, value: v, type }, { community, post }, checkTypes, preventError) => {
                    const value = name ? params[name] : v;

                    if (checkTypes.includes('correctType') && !value) {
                        if (!preventError) statusCode(response, 400, { text: `Missing parameter ${name}`, short: 'missingParameter' });
                        return false;
                    }

                    if (type === 'communityId') {
                        const community = db.communities?.[value];

                        if (checkTypes.includes('correctType') && !community) {
                            if (!preventError) statusCode(response, 404, { text: `No community found with id ${value}`, short: 'communityNotFound' });
                            return false;
                        }
                        if (
                            checkTypes.includes('hasGetPermission') ||
                            checkTypes.includes('hasDeletePermission') ||
                            checkTypes.includes('hasModifyPermission') ||
                            checkTypes.includes('hasCreatePermission')
                        ) {
                            const checkPermissionType =
                                Object.entries({
                                    hasGetPermission: 'get',
                                    hasDeletePermission: 'delete',
                                    hasModifyPermission: 'modify',
                                    hasCreatePermission: 'create'
                                }).find(([key]) => checkTypes.includes(key))[1];

                            if (!checkPermissionType)
                                throw new Error('checkPermissionType is undefined');

                            const userHasPermission = hasPermission(['database', checkPermissionType, 'community'], { owner: community.owner });

                            if (!userHasPermission) {
                                if (!preventError) statusCode(response, 403, { text: `Invalid permission to ${checkPermissionType} community ${value} (database.${checkPermissionType}.community)`, short: 'invalidPermission' });
                                return false;
                            }
                        }
                    } else if (type === 'postId') {
                        if (!community)
                            throw new Error("Can't get post without community");

                        const post = db.communities?.[community]?.posts?.[value];

                        if (checkTypes.includes('correctType') && !post) {
                            if (!preventError) statusCode(response, 404, { text: `No post found with id ${value} in community ${community}`, short: 'postNotFound' });
                            return false;
                        }
                        if (
                            checkTypes.includes('hasGetPermission') ||
                            checkTypes.includes('hasDeletePermission') ||
                            checkTypes.includes('hasModifyPermission') ||
                            checkTypes.includes('hasCreatePermission')
                        ) {
                            const checkPermissionType =
                                Object.entries({
                                    hasGetPermission: 'get',
                                    hasDeletePermission: 'delete',
                                    hasModifyPermission: 'modify',
                                    hasCreatePermission: 'create'
                                }).find(([key]) => checkTypes.includes(key))[1];

                            if (!checkPermissionType)
                                throw new Error('checkPermissionType is undefined');

                            const userHasPermission = hasPermission(['database', checkPermissionType, 'post'], { owner: post.owner });

                            if (!userHasPermission) {
                                if (!preventError) statusCode(response, 403, { text: `Invalid permission to ${checkPermissionType} post ${value} in community ${community} (database.${checkPermissionType}.post)`, short: 'invalidPermission' });
                                return false;
                            }
                        }
                    } else if (type === 'voteId') {
                        if (!community)
                            throw new Error("Can't get vote without community");

                        if (!post)
                            throw new Error("Can't get vote without post");

                        const vote = db.communities?.[community].posts?.[post]?.votes?.[value];

                        if (checkTypes.includes('correctType') && !vote) {
                            if (!preventError) statusCode(response, 404, { text: `No vote found with index ${value} in post ${post} in community ${community}`, short: 'voteNotFound' });
                            return false;
                        }
                        if (
                            checkTypes.includes('hasGetPermission') ||
                            checkTypes.includes('hasDeletePermission') ||
                            checkTypes.includes('hasModifyPermission') ||
                            checkTypes.includes('hasCreatePermission')
                        ) {
                            const checkPermissionType =
                                Object.entries({
                                    hasGetPermission: 'get',
                                    hasDeletePermission: 'delete',
                                    hasModifyPermission: 'modify',
                                    hasCreatePermission: 'create'
                                }).find(([key]) => checkTypes.includes(key))[1];

                            if (!checkPermissionType)
                                throw new Error('checkPermissionType is undefined');

                            const userHasPermission = hasPermission(['database', checkPermissionType, 'vote'], { owner: vote.owner });

                            if (!userHasPermission) {
                                if (!preventError) statusCode(response, 403, { text: `Invalid permission to ${checkPermissionType} vote ${value} in post ${post} in community ${community} (database.${checkPermissionType}.vote)`, short: 'invalidPermission' });
                                return false;
                            }
                        }
                    } else if (type === 'communityName') {
                        if (checkTypes.includes('correctType')) {
                            const correctType = value.length > 2 && value.length <= 20 && value.match(/^[a-zA-Z0-9_\- ]+$/);

                            if (!correctType) {
                                if (!preventError) statusCode(response, 400, { text: 'Invalid community name', short: 'invalidCommunityName' });
                                return false;
                            }
                        }
                    } else if (type === 'postContent') {
                        if (checkTypes.includes('correctType')) {
                            const correctType = value.length > 10 && value.length <= 500;

                            if (!correctType) {
                                if (!preventError) statusCode(response, 400, { text: 'Invalid post content', short: 'invalidPostContent' });
                                return false;
                            }
                        }
                    } else if (type === 'boolean') {
                        if (checkTypes.includes('correctType'))
                            if (typeof value !== 'boolean') {
                                if (!preventError) statusCode(response, 400, { text: `Parameter ${name} must be a boolean`, short: 'invalidParameter' });
                                return false;
                            }
                    } else if (type === 'object') {
                        if (checkTypes.includes('correctType'))
                            if (
                                typeof value !== 'object' ||
                                Array.isArray(value) ||
                                value === null
                            ) {
                                if (!preventError) statusCode(response, 400, { text: `Parameter ${name} must be an object`, short: 'invalidParameter' });
                                return false;
                            }
                    } else
                        throw new Error(`Unknown type ${type}`)

                    return true;
                }
            });

        } catch (err) {
            await parseError(err);
        }
    }
}

function doApiCall({ db, set, path, params, method, require, end, statusCode, userId }) {
    if (path === '/') {
        if (method === 'GET') {
            end(Object.keys(db.communities ?? {}));
        } else {
            statusCode(405, { text: 'Method not allowed', short: 'invalidMethod' });
            return;
        }
    } else if (path === '/community') {
        if (method === 'GET') {
            if (!require({ name: 'community', type: 'communityId' }, {}, ['correctType', 'hasGetPermission']))
                return;

            end({
                ...db.communities[params.community],
                posts: Object.keys(db.communities[params.community]?.posts ?? {})
            });
        } else if (method === 'DELETE') {
            if (!require({ name: 'community', type: 'communityId' }, {}, ['correctType', 'hasDeletePermission']))
                return;

            delete db.communities[params.community];

            set();

            statusCode(204, { text: 'Community deleted', short: 'deleted' });
        } else if (method === 'PUT') {
            if (!require({ name: 'community', type: 'communityId' }, {}, ['correctType', 'hasModifyPermission']))
                return;
            if (!require({ name: 'properties', type: 'object' }, {}, ['correctType']))
                return;

            let changed = false;

            for (const name of Object.keys(params.properties))
                if (name === 'name') {
                    if (!require({ value: params.properties[name], type: 'communityName' }, {}, ['correctType']))
                        return;

                    db.communities[params.community].name = params.name;
                    changed = true;
                }

            if (changed)
                set();

            if (require({ name: 'community', type: 'communityId' }, {}, ['hasGetPermission'], true))
                end({
                    ...db.communities[params.community],
                    posts: Object.keys(db.communities[params.community]?.posts ?? {})
                });
            else
                end(null);
        } else if (method === 'POST') {
            if (!require({ type: 'communityId' }, {}, ['hasCreatePermission']))
                return;
            if (!require({ name: 'name', type: 'communityName' }, {}, ['correctType']))
                return;

            if (!db.communities) db.communities = {}

            let id;
            while (!id || db.communities[id])
                id = Math.random().toString(36).substr(2, 9);

            db.communities[id] = {
                posts: {},
                id,
                name: params.name,
                owner: userId
            };

            set();
            end(id);
        }
    } else if (path === '/post') {
        if (method === 'GET') {
            if (!require({ name: 'community', type: 'communityId' }, {}, ['correctType']))
                return;
            if (!require({ name: 'post', type: 'postId' }, { community: params.community }, ['correctType', 'hasGetPermission']))
                return;

            end({
                ...db.communities[params.community].posts[params.post],
                votes: Object.keys(db.communities[params.community].posts[params.post]?.votes ?? {})
            });
        } else if (method === 'DELETE') {
            if (!require({ name: 'community', type: 'communityId' }, {}, ['correctType']))
                return;
            if (!require({ name: 'post', type: 'postId' }, { community: params.community }, ['correctType', 'hasDeletePermission']))
                return;

            delete db.communities[params.community].posts[params.post];

            set();

            statusCode(204, { text: 'Post deleted', short: 'deleted' });
        } else if (method === 'PUT') {
            if (!require({ name: 'community', type: 'communityId' }, {}, ['correctType']))
                return;
            if (!require({ name: 'post', type: 'postId' }, { community: params.community }, ['correctType', 'hasModifyPermission']))
                return;
            if (!require({ name: 'properties', type: 'object' }, {}, ['correctType']))
                return;

            let changed = false;

            for (const name of Object.keys(params.properties))
                if (name === 'content') {
                    if (!require({ value: params.properties[name], type: 'postContent' }, { community: params.community }, ['correctType']))
                        return;

                    db.communities[params.community].posts[params.post].content = params.content;
                    changed = true;
                }

            if (changed)
                set();

            if (require({ name: 'post', type: 'postId' }, { community: params.community }, ['hasGetPermission'], true))
                end({
                    ...db.communities[params.community].posts[params.post],
                    votes: Object.keys(db.communities[params.community].posts[params.post]?.votes ?? {})
                });
            else
                end(null);
        } else if (method === 'POST') {
            if (!require({ name: 'community', type: 'communityId' }, {}, ['correctType']))
                return;
            if (!require({ type: 'postId' }, { community: params.community }, ['hasCreatePermission']))
                return;
            if (!require({ name: 'content', type: 'postContent' }, { community: params.community }, ['correctType']))
                return;

            if (!db.communities[params.community].posts) db.communities[params.community].posts = {};
            const posts = db.communities[params.community].posts;

            let id;
            while (!id || posts[id])
                id = Math.random().toString(36).substr(2, 9);

            posts[id] = {
                votes: {},
                id,
                content: params.content,
                owner: userId,
                visibility: 'pending',
                visibilityAuthor: 'automatic',
                perspective: null
            };

            addPostToQueue({ community: params.community, post: id });

            set();
            end(id);
        }
    } else if (path === '/vote') {
        if (method === 'GET') {
            if (!require({ name: 'community', type: 'communityId' }, {}, ['correctType']))
                return;
            if (!require({ name: 'post', type: 'postId' }, { community: params.community }, ['correctType']))
                return;
            if (!require({ name: 'vote', type: 'voteId' }, { community: params.community, post: params.post }, ['correctType', 'hasGetPermission']))
                return;

            end(db.communities[params.community].posts[params.post].votes[params.vote]);
        } else if (method === 'DELETE') {
            if (!require({ name: 'community', type: 'communityId' }, {}, ['correctType']))
                return;
            if (!require({ name: 'post', type: 'postId' }, { community: params.community }, ['correctType']))
                return;
            if (!require({ name: 'vote', type: 'voteId' }, { community: params.community, post: params.post }, ['correctType', 'hasDeletePermission']))
                return;

            delete db.communities[params.community].posts[params.post].votes[params.vote];

            set();

            statusCode(204, { text: 'Post deleted', short: 'deleted' });
        } else if (method === 'PUT') {
            if (!require({ name: 'community', type: 'communityId' }, {}, ['correctType']))
                return;
            if (!require({ name: 'post', type: 'postId' }, { community: params.community }, ['correctType']))
                return;
            if (!require({ name: 'vote', type: 'voteId' }, { community: params.community, post: params.post }, ['correctType', 'hasModifyPermission']))
                return;
            if (!require({ name: 'properties', type: 'object' }, {}, ['correctType']))
                return;

            let changed = false;

            for (const name of Object.keys(params.properties))
                if (name === 'isUpVote') {
                    if (!require({ value: params.properties[name], type: 'boolean' }, { community: params.community, post: params.post, vote: params.vote }, ['correctType']))
                        return;

                    db.communities[params.community].posts[params.post].votes[params.vote] = params.isUpVote;
                    changed = true;
                }

            if (changed)
                set();

            if (require({ name: 'vote', type: 'voteId' }, { community: params.community, post: params.post }, ['hasGetPermission'], true))
                end(db.communities[params.community].posts[params.post].votes[params.vote]);
            else
                end(null);
        } else if (method === 'POST') {
            if (!require({ name: 'community', type: 'communityId' }, {}, ['correctType']))
                return;
            if (!require({ name: 'post', type: 'postId' }, { community: params.community }, ['correctType']))
                return;
            if (!require({ name: 'vote', type: 'voteId' }, { community: params.community, post: params.post }, ['hasCreatePermission']))
                return;
            if (!require({ name: 'isUpVote', type: 'boolean' }, { community: params.community, post: params.post }, ['correctType']))
                return;

            if (!db.communities[params.community].posts[params.post].votes) db.communities[params.community].posts[params.post].votes = {};
            const votes = db.communities[params.community].posts[params.post].votes;

            const id = userId;

            if (votes[id]) {
                statusCode(400, { text: 'The vote already exists', short: 'alreadyExists' });
                return;
            }

            votes[id] = {
                id,
                owner: userId,
                isUpVote: params.isUpVote
            };

            set();
            end(id);
        }
    } else {
        statusCode(404, { text: 'Endpoint not found', short: 'endpointNotFound' });
        return;
    }
}