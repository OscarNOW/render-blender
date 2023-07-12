module.exports = (cookie) => {
    return Object.fromEntries(
        cookie
            .split('; ')
            .map((cookie) => [cookie.split('=')[0], cookie.split('=')[1]])
    );
}