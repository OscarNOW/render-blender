const firebase = require('firebase-admin');

const { serviceAccount, databaseURL } = require('../../../credentials/firebase.json');

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL
}), 'appCheck';

const appCheck = firebase.appCheck();

module.exports = {
    info: {
        exports: ['appCheckPassed']
    },
    async execute({ request, parseError }) {
        try {
            const appCheckToken = request.headers['x-firebase-appcheck'];

            if (!appCheckToken) return { appCheckPassed: false };

            try {
                await appCheck.verifyToken(appCheckToken);

                return { appCheckPassed: true };
            } catch {
                return { appCheckPassed: false };
            }
        } catch (e) {
            await parseError(e);
        }
    }
}