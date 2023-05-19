const getUserRoles = require('../modules/authentication/functions/getUserRoles.js');

module.exports = {
    info: {
        cache: {
            enabled: true,
            minutes: 60,
            staleUseMinutes: 180,
            errorUseMinutes: 90,
            vary: ['Cookie', 'auth_token'],
            private: true
        }
    },
    async execute({ end, middlewareData: { authentication, customClaims }, parseError }) {
        try {
            end(JSON.stringify(getUserRoles(authentication.user, customClaims)));
        } catch (e) {
            await parseError(e);
        }
    }
}