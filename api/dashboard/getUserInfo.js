const firebase = require('../../modules/authentication/functions/getFirebase.js');

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
            if (!params.user) return statusCode(400, 'noUserProved', 'No user provided');

            const auth = firebase.auth();
            let user;
            try {
                user = await auth.getUser(params.user);
            } catch {
                return statusCode(404, 'noUserFound', 'No user found');
            }

            const email = user.email ?? user.providerData[0]?.email ?? null;

            let loginMethod = 'unknown';
            if (user.providerData[0].providerId === 'password')
                loginMethod = 'email';
            else if (user.providerData[0].providerId === 'google.com')
                loginMethod = 'google';
            else if (user.providerData[0].providerId === 'github.com')
                loginMethod = 'github';
            else if (user.providerData[0].providerId === 'anonymous')
                loginMethod = 'anonymous';

            const multiFactorUser = user.multiFactor;

            const userInfo = {
                id: user.uid,
                loginMethod,
                picture: user.photoURL,
                displayName: user.displayName,
                email,
                emailVerified: user.email ? user.emailVerified : true,
                phoneNumber: user.phoneNumber,
                creationTime: user.metadata.creationTime,
                lastSignInTime: user.metadata.lastSignInTime,
                '2fa': !multiFactorUser?.enrolledFactors ? [] : multiFactorUser?.enrolledFactors.map((factor) => ({
                    creationTime: factor.enrollmentTime,
                    type: factor.factorId,
                    displayName: factor.displayName,
                    phoneNumber: factor.phoneNumber,
                    id: factor.uid
                }))
            };

            const accessibleUserInfo = {};

            hasPermission = await hasPermission;

            for (const [key, value] of Object.entries(userInfo)) {
                const permissionParts = ['dashboard', 'get', 'userInfo', key];

                if (hasPermission(permissionParts, { owner: user.uid }))
                    accessibleUserInfo[key] = value;
            }

            end(JSON.stringify(accessibleUserInfo))

        } catch (e) {
            await parseError(e)
        }
    }
}