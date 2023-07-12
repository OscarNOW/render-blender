const fs = require('fs');

function execute(request, response, { middlewareData, extraData: { body } }) {
    console.log(body)
}

module.exports = { execute };