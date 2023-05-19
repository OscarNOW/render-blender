const { roles, customRoles } = require('../../../settings.json').permissions;

module.exports = (role) => {
    const roleType = role.split(':')[0];
    const roleName = role.split(':')[1];

    if (roleType === 'roles')
        return roles[roleName];
    else if (roleType === 'customRoles')
        return customRoles[roleName];
    else
        throw new Error(`Invalid role type ${roleType}`);
}