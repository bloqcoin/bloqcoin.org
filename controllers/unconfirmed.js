'use strict';

const utils = require('../middleware/utils.js');

var self;

class Controller {

	constructor() {

		self = this;

		self.daemon = utils.getDaemon();
	}

	get = async function(req, res) {

		const data = await self.listTransactions();

		const transactions = [];

		await Promise.all(data.map(async (transaction) => {

			if (transaction.confirmations < 3) {

				transactions.push(transaction);
			}
		}));

		// 200 OK
		return res.status(200).json(transactions);
	}

	listTransactions = function() {

		return new Promise((resolve, reject) => {

			self.daemon.listtransactions(function(err, data) {

				if (err) {

					reject(err);
				}

				resolve(data);
			});
		});
	}
}

module.exports = Controller;