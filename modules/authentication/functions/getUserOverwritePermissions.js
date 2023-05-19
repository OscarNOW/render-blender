module.exports = (customClaims) => {
    if (customClaims?.permissions)
        return customClaims.permissions;
    else
        return {};
}