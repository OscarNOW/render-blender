const settings = require('../../settings.json')
const parseErrorOnline = require('../functions/error/parseErrorOnline').execute;

module.exports = {
    execute(request, response) {
        const parseError = (error, customText) => parseErrorOnline(error, response, customText);

        try {

            // if (request.url.toLowerCase() == '/errors') {
            //     let t = [];
            //     require('fs').readdirSync('./logs/errors/').forEach(v => t.push(require('fs').readFileSync('./logs/errors/' + v).toString()))
            //     return response.end(JSON.stringify(t))
            // } else
            if (request.url.toLowerCase().startsWith(settings.generic.path.online.api))
                return require('../server/api.js').execute(request, response);
            else
                return require('./normal.js').execute(request, response);

        } catch (err) {
            parseError(err);
        }
    }
}