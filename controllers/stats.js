'use strict';

const utils = require('../middleware/utils.js');

var self;

class Controller {

	constructor() {

		self = this;

		self.daemon = utils.getDaemon();
	}

	get = async function(req, res) {

		const data = await self.getNetworkInfo();

		// 200 OK
		return res.status(200).json(data);
	}

	getNetworkInfo = function() {

		return new Promise((resolve, reject) => {

			self.daemon.getnetworkinfo(function(err, data) {

				if (err) {

					reject(err);
				}

				resolve(data);
			});
		});
	}
}

module.exports = Controller;