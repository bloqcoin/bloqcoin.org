'use strict';

const utils = require('../middleware/utils.js');

var self;

class Controller {

	constructor() {

		self = this;

		self.daemon = utils.getDaemon();
	}

	get = async function(req, res) {

		// get the previous block
		const height = await self.getBlockCount();
		const kHps = await self.getNetworkHashps(height);

		/*
		kH/s (kilo hashes per second) = 1000 H/s
		MH/s (Mega hashes per second) = 1,000,000 H/s
		GH/s (giga hashes per second) = 1,000,000,000 H/s
		TH/s (tera hashes per second) = 1,000,000,000,000 H/s
		*/

		// 200 OK
		return res.status(200).json({
			kH: kHps,
			MH: ((kHps * 10000) / 1000000),
			GH: ((kHps * 10000) / 1000000000),
			TH: ((kHps * 10000) / 1000000000000)
		});
	}

	getBlockCount = () => {

		return new Promise((resolve, reject) => {

			self.daemon.getblockcount(function(err, data) {

				if (err) {

					reject(err);
				}

				resolve(data);
			});
		});
	}

	getNetworkHashps = function(height) {

		return new Promise((resolve, reject) => {

			self.daemon.getnetworkhashps(height, function(err, data) {

				if (err) {

					reject(err);
				}

				resolve(data);
			});
		});
	}
}

module.exports = Controller;