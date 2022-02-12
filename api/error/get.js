const fs = require('fs');

module.exports = {
    execute({ end }) {
        let errors = [];
        fs.readdirSync('./logs/errors/').forEach(val => {
            if (val == '.noError') return;
            errors.push(fs.readFileSync(`./logs/errors/${val}`).toString())
        })

        end(JSON.stringify(errors))
    }
}