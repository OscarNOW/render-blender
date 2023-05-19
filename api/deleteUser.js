const firebase = require('../modules/authentication/functions/getFirebase.js');

module.exports = {
    async execute({ end, params, middlewareData: { authentication, hasPermission }, statusCode, parseError }) {
        try {
            const userId = params.user;
            if (!userId) return statusCode(400, 'noUserProvided', 'No user provided');

            hasPermission = await hasPermission;
            authentication = await authentication;

            if (!hasPermission('user.delete', { owner: userId }))
                return statusCode(403, 'invalidPermission', 'You do not have permission to delete this user (user.delete)');

            const auth = firebase.auth();

            const authTime = new Date(authentication.auth_time * 1000);
            const authAge = (new Date().getTime() - authTime.getTime()) / 1000; // authAge in seconds

            if (authAge > 5 * 60) return statusCode(403, 'oldLogin', 'The login is too old, login again');

            await auth.deleteUser(authentication.uid);

            end();
        } catch (e) {
            await parseError(e);
        }
    }
}