const { fork } = require('child_process');
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

module.exports = async () => {
    await execute();
}

async function execute() {
    await wait(3000);
    const child = await fork('modules/perspective/container/index.js');

    child.on('exit', () => {
        console.log('Perspective container exited. Restarting...')
        execute();
    });
}