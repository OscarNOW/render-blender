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
            if (!params.phoneNumber) return statusCode(400, 'noPhoneNumberProvided', 'No phone number provided');

            hasPermission = await hasPermission;

            if (!hasPermission('dashboard.getUserFrom.phoneNumber'))
                return statusCode(403, 'invalidPermission', 'Invalid permission (dashboard.getUserFrom.phoneNumber)');

            const auth = firebase.auth();
            let user;
            try {
                user = await auth.getUserByPhoneNumber(params.phoneNumber);
            } catch {
                return statusCode(404, 'noUserFound', 'No user found');
            }

            end(user.uid);

        } catch (e) {
            await parseError(e)
        }
    }
}