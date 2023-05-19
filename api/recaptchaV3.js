const { endpoint, private: secret } = require('../credentials/recaptchaV3.json');

const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': null
};

const allowedTokenCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'.split('');

module.exports = {
    async execute({ params, end, statusCode, request, parseError }) {
        try {
            if (!params.token) return statusCode(400, 'noTokenProvided', 'No token provided');
            if (![526, 548].includes(params.token.length)) return statusCode(400, 'invalidToken', 'Invalid token');
            if (params.token.split('').some((char) => !allowedTokenCharacters.includes(char))) return statusCode(400, 'invalidToken', 'Invalid token');

            const postData = Object.entries({
                secret,
                response: params.token,
                remoteip: request.socket.remoteAddress
            }).map(([key, value]) => `${key}=${value}`).join('&');

            headers['Content-Length'] = postData.length;

            const response = await fetch(endpoint, {
                method: 'POST',
                body: postData,
                headers
            });

            const result = await response.json();

            // console.log('[WARNING] Generating fake recaptcha response in /api/recaptchaV3.js')
            // const result = {
            //     success: true,
            //     score: 0.2
            // };

            if (!result.success)
                if (result['error-codes'].includes('missing-input-secret') || result['error-codes'].includes('invalid-input-secret') || result['error-codes'].includes('bad-request'))
                    throw new Error(`Recaptcha: Server has invalid config: ${result['error-codes'].join(', ')}`);
                else if (result['error-codes'].includes('missing-input-response') || result['error-codes'].includes('invalid-input-response'))
                    return statusCode(400, 'invalidToken', 'Invalid token');
                else if (result['error-codes'].includes('timeout-or-duplicate'))
                    return statusCode(400, 'tokenExpired', 'Token has expired or has already been used');
                else
                    return statusCode(400, 'unknown', 'Unknown error');

            end(`${result.score}`);

        } catch (e) {
            return parseError(e);
        }
    }
}
