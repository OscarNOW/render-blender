const firebase = require('../../../modules/authentication/functions/getFirebase.js');

module.exports = {
    info: {
        exports: ['customClaims'],
        requires: ['authentication']
    },
    async execute({ parseError, middlewareData: { authentication } }) {
        try {
            if (!authentication) return { customClaims: {} };

            const firebaseUser = await firebase.auth().getUser(authentication.sub);
            const customClaims = firebaseUser.customClaims;
            return { customClaims };
        } catch (e) {
            await parseError(e);
        }
    }
}