const firebase = require('../../modules/authentication/functions/getFirebase.js');
const possibleProperties = Object.freeze({
    email: 'email',
    emailVerified: 'emailVerified',
    phoneNumber: 'phoneNumber',
    password: 'password',
    displayName: 'displayName',
    picture: 'photoURL'
});

module.exports = {
    async execute({ params, statusCode, parseError, end, middlewareData: { hasPermission } }) {
        try {
            if (!params.user) return statusCode(400, 'noUserProved', 'No user provided');

            let properties = params.properties;
            if (!properties) return statusCode(400, 'noPropertiesProvided', 'No properties provided');
            try {
                properties = JSON.parse(properties);
            } catch {
                return statusCode(400, 'invalidProperties', 'Invalid properties');
            }

            const newProperties = {};

            hasPermission = await hasPermission;
            for (const [key, value] of Object.entries(properties)) {
                if (!possibleProperties[key]) return statusCode(400, 'unknownProperty', `Unknown property ${key}`);

                const userHasPermission = hasPermission(['dashboard', 'modify', 'userInfo', key], { owner: params.user });

                if (!userHasPermission) return statusCode(403, 'invalidPermission', `Invalid permission to modify ${key} (dashboard.modify.userInfo.${key}))`);

                if (key === 'email') {
                    const userHasEmailVerifiedPermission = hasPermission('dashboard.modify.userInfo.emailVerified', { owner: params.user });

                    if (!userHasEmailVerifiedPermission)
                        newProperties.emailVerified = false;
                }

                newProperties[possibleProperties[key]] = value;
            }

            const auth = firebase.auth();
            try {
                await auth.updateUser(params.user, newProperties);
            } catch (e) {
                return statusCode(400, e?.code || 'invalidArguments', e?.message || 'Invalid arguments');
            }

            end();

        } catch (e) {
            await parseError(e)
        }
    }
}