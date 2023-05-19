const firebase = require('../../../modules/authentication/functions/getFirebase.js');
const parseCookie = require('../../functions/parse/cookie.js');

module.exports = {
    info: {
        exports: ['authenticated', 'authentication', 'explicitlyAuthenticated']
    },
    async execute({ request, parseError }) {
        try {

            const explicitlyAuthenticated = Boolean(request.headers['auth_token']);
            let authHeaders;
            if (explicitlyAuthenticated)
                authHeaders = request.headers;
            else
                authHeaders = getAuthHeadersFromCookie(request.headers.cookie);

            const authToken = authHeaders?.['auth_token'];

            if ((!authHeaders) || (!authToken))
                return { authenticated: false, authentication: null, explicitlyAuthenticated };

            try {
                const authentication = await firebase.auth().verifyIdToken(authToken, true);

                return {
                    authenticated: true,
                    authentication,
                    explicitlyAuthenticated
                };
            } catch {
                return {
                    authenticated: false,
                    authentication: null,
                    explicitlyAuthenticated
                };
            }

        } catch (e) {
            await parseError(e);
        }
    }
}

function getAuthHeadersFromCookie(cookie) {
    if (!cookie) return null;
    let authHeaders = parseCookie(cookie).authHeaders;
    if (!authHeaders) return null;

    try {
        authHeaders = JSON.parse(authHeaders);
    } catch {
        return null;
    }

    return authHeaders;
}