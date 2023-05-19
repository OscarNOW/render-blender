const getPermission = require('./getPermission.js');

module.exports = (permissionParts, checks, user, customClaims) => {
    const permission = getPermission(permissionParts, user, customClaims);

    checks = {
        ...(checks || {}),
        always: true,
        never: false
    };

    for (const requirement of permission)
        if (!checks[requirement])
            return false;

    return true;
}