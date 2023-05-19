const getUserRoles = require('./getUserRoles.js');
const getRolePermissions = require('./getRolePermissions.js');
const getUserOverwritePermissions = require('./getUserOverwritePermissions.js');
const combinePermissions = require('./combinePermissions.js');

module.exports = (user, customClaims) => {
    const userRoles = getUserRoles(user, customClaims);
    const userRolePermissions = userRoles.map(getRolePermissions);
    const userOverwritePermissions = getUserOverwritePermissions(customClaims);
    const userPermissions = combinePermissions([...userRolePermissions, userOverwritePermissions]);

    return userPermissions;
}