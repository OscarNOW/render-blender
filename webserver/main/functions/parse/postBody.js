module.exports = (body) => {
    return Object.fromEntries(body.split('&').map((a) => a.split('=')));
}