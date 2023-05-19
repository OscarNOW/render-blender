const hasPermission = require('../../../modules/authentication/functions/hasPermission.js');

module.exports = {
    info: {
        exports: ['hasPermission'],
        requires: [
            'authentication',
            'customClaims',
            'appCheck'
        ]
    },
    execute({ middlewareData: { authentication, explicitlyAuthenticated, customClaims, appCheckPassed } }) {
        return {
            hasPermission: (permission, { owner }) => {
                const checks = {
                    owner: owner === undefined ? undefined : owner === authentication.uid,
                    appCheck: appCheckPassed,
                    explicitAuth: explicitlyAuthenticated
                };

                hasPermission(permission, checks, authentication, customClaims)
            }
        };
    }
}