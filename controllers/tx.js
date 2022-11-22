'use strict';

const utils = require('../middleware/utils.js');

var self;

class Controller {

	constructor() {

		self = this;

		self.daemon = utils.getDaemon();
	}

	get = async function(req, res) {

		console.log(req);

		const data = await self.getTransaction(1);

		// 200 OK
		return res.status(200).json(data);
	}

	getTransaction = (txid) => {

		return new Promise((resolve, reject) => {

			self.daemon.gettransaction(txid, (err, data) => {

				if (err) {

					reject(err);
				}

				resolve(data);
			});
		});
	}
}

module.exports = Controller;