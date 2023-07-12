const repairSettings = {
    jsonBeginEnd: [
        ['', '}'],
        ['{', ''],
        ['{', '}']
    ],
    projectDependencies: [
        'mime-types'
    ]
}

module.exports = {
    async execute(server) {
        const t = require(__filename);

        let changed = [];
        let logs = [];

        server.close();

        const currentReturn = await t.repairs.modules.node_modules();
        changed = changed.concat(currentReturn?.changed || [])
        logs = logs.concat(currentReturn?.logs || [])

        return {
            changed,
            logs
        }

    },
    repairs: {
        modules: {
            async node_modules() {
                const changed = [];
                const logs = [];
                try {
                    const settings = require('../../../settings.json');
                    const fs = require('fs');

                    const installModules = [];

                    const installModule = (name) => {
                        try {
                            require.resolve(name)
                        } catch {
                            installModules.push(name);
                            changed.push({
                                tag: 'installedNodeModule',
                                value: name
                            });
                        }
                    }

                    repairSettings.projectDependencies.forEach((val) => {
                        installModule(val);
                    })

                    const modules = fs.readdirSync(settings.generic.path.files.modules);
                    modules.forEach((val) => {

                        const extraDependenciesPath = `${settings.generic.path.files.modules}${val}/${settings.generic.path.files.extraDependencies}`;
                        console.log(extraDependenciesPath)
                        if (fs.existsSync(extraDependenciesPath)) {
                            try {
                                const extraDependencies = require(extraDependenciesPath);

                                if (extraDependencies?.node_modules)
                                    extraDependencies.node_modules.forEach((val) => {
                                        installModule(val)
                                    })
                            } catch (err) {
                                logs.push({
                                    tag: 'error',
                                    value: err
                                })
                            }
                        }

                        const apiPath = settings.generic.path.files.moduleApi.replace('{modules}', settings.generic.path.files.modules).replace('{name}', val);
                        if (fs.existsSync(apiPath)) {
                            const apis = fs.readdirSync(apiPath);
                            apis.forEach((api) => {
                                try {
                                    const apiFile = require(`../../.${settings.generic.path.files.moduleApi.replace('{modules}', settings.generic.path.files.modules).replace('{name}', val)}${api}`);
                                    if (apiFile.dependencies?.node_modules) {
                                        apiFile.dependencies.node_modules.forEach((val) => {
                                            installModule(val);
                                        })
                                    }
                                } catch (err) {
                                    logs.push({
                                        tag: 'error',
                                        value: err
                                    })
                                }
                            })
                        }
                    })

                    if (installModules)
                        await require('../installNodeModule').execute(installModules)

                    return {
                        changed,
                        logs
                    }
                } catch (err) {
                    return {
                        changed,
                        logs: [{
                            tag: 'error',
                            value: err
                        }]
                    }
                }
            }
        }
    }
}