module.exports = (user, customClaims) => {
    const userRoles = [];

    userRoles.push('roles:empty');
    userRoles.push('roles:default');
    if (user) userRoles.push('roles:authenticated');

    if (customClaims?.roles)
        for (const role of customClaims.roles)
            userRoles.push(`customRoles:${role}`);

    return userRoles;
}