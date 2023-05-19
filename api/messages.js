const getMessages = require('../main/functions/get/messages.js');

module.exports = {
    info: {
        cache: {
            enabled: true,
            minutes: 60,
            staleUseMinutes: 180,
            errorUseMinutes: 90,
            vary: ['Cookie', 'Accept-Language']
        }
    },
    async execute({ request, end, parseError }) {
        try {
            const messages = (await getMessages.execute({ request })).messages;

            end(JSON.stringify(messages));
        } catch (e) {
            await parseError(e);
        }
    }
}