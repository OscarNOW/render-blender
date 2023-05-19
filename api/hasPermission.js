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
    async execute({ end, middlewareData: { hasPermission }, params, statusCode, parseError }) {
        try {
            if (!params.permission) return statusCode(400, 'noPermissionProvided', 'No permission provided');
            let permissionParts;
            try {
                permissionParts = JSON.parse(params.permission);
            } catch {
                return statusCode(400, 'invalidPermission', 'Invalid permission');
            };

            if (!params.info) return statusCode(400, 'noInfoProvided', 'No info provided');
            let info;
            try {
                info = JSON.parse(params.info);
            } catch {
                return statusCode(400, 'invalidInfo', 'Invalid info');
            };

            hasPermission = await hasPermission;
            end(hasPermission(permissionParts, info));
        } catch (e) {
            await parseError(e);
        }
    }
}