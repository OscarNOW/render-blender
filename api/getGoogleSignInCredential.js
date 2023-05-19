// if renaming or moving this file, also update path in main/server/middleware/googleSignIn.js

const googleCredentials = {};

module.exports = {
    execute({ end, statusCode, params }) {
        if (!params.token) return statusCode(400, 'noToken', 'No token provided');

        const credential = googleCredentials[params.token];
        if (!credential) return statusCode(400, 'invalidToken', 'Invalid token provided');

        delete googleCredentials[params.token];
        end(credential);
    },
    setCredential(token, credential) {
        googleCredentials[token] = credential;
    }
}