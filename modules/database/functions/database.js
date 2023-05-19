let db;
let ref;
let firebase;

let dataResolve;
let dataPromise = new Promise((res) => { dataResolve = res });
let dataResolved = false;
let err;

let hasInit = false;
function init() {
    firebase = require('./getFirebase.js');
    db = firebase.database();
    ref = db.ref();

    ref.on('value', (snapshot) => {
        if (dataResolved)
            dataPromise = Promise.resolve(snapshot.val());
        else {
            dataResolve(snapshot.val());
            dataResolved = true;
        }
    }, (error) => {
        err = error;
    });

    hasInit = true;
};

module.exports = {
    async set(val) {
        if (!hasInit)
            init();

        await dataPromise;

        ref.set(val)
    },
    async get() {
        if (!hasInit)
            init()

        if (err)
            throw err;

        let data = await dataPromise;
        if (!data) data = {};

        return data;
    }
}