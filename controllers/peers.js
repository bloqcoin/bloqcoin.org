'use strict';

const utils = require('../middleware/utils.js');
const geoip = require('geoip-lite');

var self;

class Controller {

	constructor() {

		self = this;

		self.daemon = utils.getDaemon();
	}

	get = async function(req, res) {

		const peers = await self.getPeerInfo();

		await Promise.all(peers.map(peer => {

			const ip = peer.addr.split(':')[0];

			if (ip === '127.0.0.1') {

				peer.country = 'LC';
				peer.timezone = 'Local/Bloqcoin';
			}
			else {

				// get country from addr
				try {

					const geo = geoip.lookup(ip);
					peer.country = geo.country;
					peer.city = geo.city;
					peer.ll = geo.ll;
					peer.timezone = geo.timezone;
				}
				catch {}
			}
		}));

		// 200 OK
		return res.status(200).json(peers);
	}

	getPeerInfo = function() {

		return new Promise((resolve, reject) => {

			self.daemon.getpeerinfo(function(err, data) {

				if (err) {

					reject(err);
				}

				resolve(data);
			});
		});
	}
}

module.exports = Controller;