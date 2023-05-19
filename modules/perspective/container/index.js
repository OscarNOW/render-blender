console.log('Running perspective container');
const debugLog = () => { };

const { get, set } = require('../../database/functions/database.js');
const perspective = require('./functions/perspective.js');
const actOnScore = require('./functions/actOnScore.js');

const fs = require('fs');
const path = require('path');

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

if (!fs.existsSync(path.resolve(__dirname, '../data/')))
    fs.mkdirSync(path.resolve(__dirname, '../data/'));

if (!fs.existsSync(path.resolve(__dirname, '../data/queue.json')))
    fs.writeFileSync(path.resolve(__dirname, '../data/queue.json'), JSON.stringify([]));

(async () => {
    while (true) {
        await wait(1500); // Perspective API has a rate limit of 60 requests per minute, so with a 1.5s wait per request we're safe
        await execute();
    }
})();

async function execute() {
    const queue = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/queue.json')).toString());
    if (queue.length === 0) return;

    debugLog()
    debugLog('\x1b[31m\x1b[1m', 'Queue:', queue.length, '\x1b[0m') // red, bright, reset

    const { community, post } = queue[0];

    debugLog()
    debugLog(community, post)
    debugLog('Getting post from database...')

    const db = await get();
    const dbPost = db.communities?.[community]?.posts?.[post];

    if (dbPost) {
        debugLog('Running perspective...')
        const result = await perspective(dbPost.content);

        debugLog('Saving to database...')
        dbPost.perspective = result;
        await set(db);

        debugLog('Acting on score...')
        await actOnScore(community, post);
    } else
        console.log('[PERSPECTIVE ANALYSER] Post not found in database.', community, post)

    debugLog('Updating queue...')
    const newQueue = queue.slice(1);
    fs.writeFileSync(path.resolve(__dirname, '../data/queue.json'), JSON.stringify(newQueue));
}