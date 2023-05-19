const firebase = require('../../modules/authentication/functions/getFirebase.js');

module.exports = {
    async execute({ params, statusCode, parseError, end, middlewareData: { hasPermission } }) {
        try {
            if (!params.user) return statusCode(400, 'noUserProved', 'No user provided');

            hasPermission = await hasPermission;

            const userHasPermission = hasPermission('dashboard.remove.2fa', { owner: params.user });

            if (!userHasPermission) return statusCode(403, 'invalidPermission', 'Invalid permission to remove 2fa (dashboard.remove.2fa)');

            const auth = firebase.auth();
            try {
                await auth.updateUser(params.user, {
                    multiFactor: {
                        enrolledFactors: []
                    }
                });
            } catch {
                return statusCode(400, 'invalidUser', 'Invalid user');
            }

            end();

        } catch (e) {
            await parseError(e)
        }
    }
}