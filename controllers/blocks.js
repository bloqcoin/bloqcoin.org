'use strict';

const utils = require('../middleware/utils.js');

var self;

class Controller {

	constructor() {

		self = this;

		self.daemon = utils.getDaemon();
	}

	get = async function(req, res) {

		if (req.body.block) {

			const data = await self.getBlockHeader(req.body.block);

			// 200 OK
			return res.status(200).json(data);
		}

		const data = await self.getBlocks();

		// 200 OK
		return res.status(200).json(data);
	}

	getBlocks = async function() {

		const blocks = [];

		const blockCount = await self.getBlockCount();

		for (let i = blockCount; i >= (blockCount - parseInt(process.env.BLOCK_COUNT)); i--) {

			const blockHash = await self.getBlockHash(i);

			const blockHeader = await self.getBlockHeader(blockHash);

			blocks.push(blockHeader);
		}

		return blocks;
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

	getBlockHash = (height) => {

		return new Promise((resolve, reject) => {

			self.daemon.getblockhash(height, (err, data) => {

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