module.exports = {
    dependencies: {
        node_modules: [
            'sniffr'
        ]
    },
    execute(argument) {
        const { end, request } = argument;

        end(JSON.stringify(require('../getInfo.js').execute(request)));
    }
};
