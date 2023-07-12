const npm = require('npm');
module.exports = {
    execute(modules) {
        if (!JSON.stringify(modules).startsWith('['))
            throw new Error(`Modules (${modules}) (${JSON.stringify(modules)}) is not an array`)

        return new Promise((resolve) => {
            npm.load((err) => {
                if (err) throw err;

                npm.commands.install(modules, (err) => {
                    if (err) throw err;
                    resolve()
                })
            })
        })
    }
}