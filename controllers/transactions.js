'use strict';

const utils = require('../middleware/utils.js');

var self;

class Controller {

	constructor() {

		self = this;

		self.daemon = utils.getDaemon();
	}

	get = async function(req, res) {

		try {

			const data = await self.getRawTransaction(req.body.txid);
			const blockHeader = await self.getBlockHeader(data.blockhash);

			// 200 OK
			return res.status(200).json({
				height: blockHeader.height,
				blockhash: data.blockhash,
				time: data.time
			});
		}
		catch {}
		
		return res.status(404).send({ url: req.originalUrl + ' not found' })
	}

	getRawTransaction = (txid) => {

		return new Promise((resolve, reject) => {

			self.daemon.getrawtransaction(txid, 1, (err, data) => {

				if (err) {

					reject(err);
				}

				resolve(data);
			});
		});
	}

	getBlockHeader = (hash) => {

		return new Promise((resolve, reject) => {

			self.daemon.getblockheader(hash, (err, data) => {

				if (err) {

					reject(err);
				}

				resolve(data);
			});
		});
	}
}

module.exports = Controller;