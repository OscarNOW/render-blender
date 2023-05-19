const firebase = require('../../../modules/authentication/functions/getFirebase.js');

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
    async execute({ params, statusCode, parseError, end, middlewareData: { hasPermission } }) {
        try {
            if (!params.email) return statusCode(400, 'noEmailProvided', 'No email provided');

            hasPermission = await hasPermission;

            if (!hasPermission('dashboard.getUserFrom.email'))
                return statusCode(403, 'invalidPermission', 'Invalid permission (dashboard.getUserFrom.email)');

            const auth = firebase.auth();
            let user;
            try {
                user = await auth.getUserByEmail(params.email);
            } catch {
                return statusCode(404, 'noUserFound', 'No user found');
            }

            end(user.uid);

        } catch (e) {
            await parseError(e)
        }
    }
}