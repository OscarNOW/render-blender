const { google } = require('googleapis');

const { apiKey, discoveryUrl } = require('../../../../credentials/perspective.json');

module.exports = async (message) => {
    const client = await google.discoverAPI(discoveryUrl);

    const analyzeRequest = {
        comment: {
            text: message
        },
        requestedAttributes: {
            TOXICITY: {},
            SEVERE_TOXICITY: {},
            IDENTITY_ATTACK: {},
            INSULT: {},
            PROFANITY: {},
            THREAT: {}
        }
    };

    const response = await analyzeAsync(client, analyzeRequest);

    return {
        languages: response.languages,
        attributes: Object.fromEntries(
            Object.entries(response.attributeScores)
                .map(([key, value]) => ([
                    key,
                    value.summaryScore.value
                ]))
        )
    }
};


function analyzeAsync(client, analyzeRequest) {
    return new Promise((res, rej) => {
        client.comments.analyze(
            {
                key: apiKey,
                resource: analyzeRequest
            },
            (err, response) => {
                if (err) rej(err);
                else res(response.data);
            }
        );
    });
};