const urlLibrary = require('url');

module.exports = {
    execute(request) {
        const url = urlLibrary.parse(request.url);
        const path = `/${url.pathname.split('/api/').slice(1).join('/api/')}`;

        let success = true;
        let params = null;

        if (['GET', 'DELETE'].includes(request.method))
            params = url.query ?
                Object.fromEntries(
                    url.query.split('&')
                        .map((a) => a.split('='))
                        .map(([key, value]) => [key, decodeURIComponent(value)])
                ) : {};
        else if (request.headers['content-type'] === 'application/json')
            try {
                params = JSON.parse(request.headers.body);
            } catch {
                success = false;
            }

        return { path, params, success };
    }
}