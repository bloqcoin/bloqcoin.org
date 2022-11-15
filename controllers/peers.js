'use strict';

const utils = require('../middleware/utils.js');

var self;

class Controller {

	constructor() {

		self = this;

		self.daemon = utils.getDaemon();
	}

	get = async function(req, res) {

		const data = await self.getPeerInfo();

		// 200 OK
		return res.status(200).json(data);
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