const { minimalScores } = require('../settings.json');

module.exports = {
    info: {
        cache: {
            enabled: true,
            minutes: 60,
            staleUseMinutes: 180,
            errorUseMinutes: 90
        }
    },
    execute({ end }) {
        end(JSON.stringify(minimalScores));
    }
}