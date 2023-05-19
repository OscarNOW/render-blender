const { client_id } = require('../../../credentials/googleClientId.json');

const { setCredential } = require('../../../api/getGoogleSignInCredential.js');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(client_id);

module.exports = {
    info: {
        exports: ['googleUserId'],
        requireRun: true
    },
    async execute({ extraData, parseError }) {
        try {

            if (!extraData.body?.g_csrf_token) return { googleUserId: null };

            const { credential, clientId, g_csrf_token } = extraData.body;

            let ticket;
            try {
                ticket = await client.verifyIdToken({
                    idToken: credential,
                    audience: clientId
                });
            } catch {
                return { googleUserId: null };
            };
            const payload = ticket.getPayload();
            const userid = payload['sub'];

            setCredential(g_csrf_token, credential);

            return { googleUserId: userid }

        } catch (e) {
            await parseError(e);
        }
    }
}