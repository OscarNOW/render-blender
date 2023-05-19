module.exports = combinePermissions;

function combinePermissions(permissions) {
    let currentPermissions = {};

    for (const permission of permissions)
        currentPermissions = combinePermissionsRecursive(currentPermissions, permission);

    return currentPermissions;
}

function combinePermissionsRecursive(oldPermissions, newPermissions) {
    if (isObject(newPermissions) && Object.keys(newPermissions).length === 0)
        return oldPermissions;

    if (oldPermissions === undefined) return newPermissions;
    if (newPermissions === undefined) return oldPermissions;

    if (!isObject(newPermissions))
        return newPermissions;
    else if (!isObject(oldPermissions) && isObject(newPermissions))
        return {
            _other: oldPermissions,
            ...newPermissions
        };
    else if (isObject(oldPermissions) && isObject(newPermissions)) {

        const currentPermissions = Object.assign({}, oldPermissions);

        for (const [name, newPermission] of Object.entries(newPermissions))
            currentPermissions[name] = combinePermissionsRecursive(currentPermissions[name], newPermission);

        return currentPermissions;

    }
}

function isObject(obj) {
    return typeof obj === 'object' &&
        obj !== null &&
        !Array.isArray(obj);
}