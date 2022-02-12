const sniffr = require('sniffr');

module.exports = {
	dependencies: {},
	execute(request, cookie) {
		const s = new sniffr();
		s.sniff(request.headers['user-agent']);

		let ip = (request.headers['x-forwarded-for'] || '').split(',').pop().trim() || request.connection.remoteAddress || request.socket.remoteAddress || request.connection.socket.remoteAddress;

		let object = {};

		if (ip)
			object.ip = {
				value: ip
			};
		if (cookie) object.cookie = cookie;

		let browser = {
			name: s.browser.name == 'Unknown' ? null : s.browser.name,
			version: s.browser.version == 'Unknown' ? null : s.browser.version
		};
		if (browser.name || browser.version) object.browser = browser;

		let os = {
			name: s.os.name == 'Unknown' ? null : s.os.name,
			version: s.os.version == 'Unknown' ? null : s.os.version
		};
		if (os.name || os.version) object.os = os;

		let device = {
			name: s.device.name == 'Unknown' ? null : s.device.name
		};
		if (device.name) object.device = device;

		let langObject = [];

		let langHeader = request.headers['accept-language'];
		if (langHeader) {
			let langs = langHeader.split(',');

			langs.forEach((val) => {
				let lang = val.split(';')[0].split('-')[0];
				let region = null;
				if (val.split(';')[0].split('-').length > 1) region = val.split(';')[0].split('-')[1];

				let quality = 1;
				if (val.split(';').length > 1) {
					quality = parseFloat(val.split(';')[1].split('q=')[1]);
				}

				let out = {
					name: lang,
					quality
				};

				if (region) out.region = region;

				langObject.push(out);
			});

			object.lang = langObject;
		}

		return object;
	}
};
