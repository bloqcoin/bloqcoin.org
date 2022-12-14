'use strict';

require('dotenv').config();

// Library for setting up websocket to frontend clients
const WebSocket = require('ws');

const Stratum = require('./middleware/stratum-pool');
const util = require('./middleware/stratum-pool/lib/util.js');
const pool = Stratum.createPool({
	"coin": {
		"name": "Bloqcoin",
		"symbol": "BLOQ",
		"algorithm": "sha256",
		"chainStartTime": 1668359165,
		"nValue": 1024, // optional - defaults to 1024
		"rValue": 1, // optional - defaults to 1
		"txMessages": false, // optional - defaults to false,

		/**
		 * Magic value only required for setting up p2p block notifications. It is found in the daemon
		 * source code as the pchMessageStart variable.
		 * For example, litecoin mainnet magic: http://git.io/Bi8YFw
		 * And for litecoin testnet magic: http://git.io/NXBYJA
		 */
		"peerMagic": "f9beb4d9", // optional
		"peerMagicTestnet": "0b110907" // optional
	},

	// address to where block rewards are given
	"address": process.env.REWARDS_ADDRESS,

	/**
	 * Block rewards go to the configured pool wallet address to later be paid out to miners,
	 * except for a percentage that can go to, for examples, pool operator(s) as pool fees or
	 * or to donations address. Addresses or hashed public keys can be used. Here is an example
	 * of rewards going to the main pool op, a pool co-owner, and NOMP donation.
	 */
	"rewardRecipients": {
		[process.env.REWARDS_ADDRESS]: 1.5 // 1.5% goes to pool op
    },

	// how often to poll RPC daemons for new blocks, in milliseconds
	"blockRefreshInterval": 1000,

    // how many milliseconds should have passed before new block transactions will trigger a new job broadcast.
	"txRefreshInterval": 20000,

	/**
	 * Some miner apps will consider the pool dead/offline if it doesn't receive anything new jobs
	 * for around a minute, so every time we broadcast jobs, set a timeout to rebroadcast
	 * in this many seconds unless we find a new job. Set to zero or remove to disable this.
	 */
	"jobRebroadcastTimeout": 55,

	/**
	 * Some attackers will create thousands of workers that use up all available socket connections,
	 * usually the workers are zombies and don't submit shares after connecting. This features
	 * detects those and disconnects them.
	 * Remove workers that haven't been in contact for this many seconds
	 */
	"connectionTimeout": 600,

	// Sometimes you want the block hashes even for shares that aren't block candidates.
	"emitInvalidBlockHashes": false,

	/**
	 * Enable for client IP addresses to be detected when using a load balancer with TCP proxy
	 * protocol enabled, such as HAProxy with 'send-proxy' param:
	 * http://haproxy.1wt.eu/download/1.5/doc/configuration.txt
	 */
	"tcpProxyProtocol": false,

	/**
	 * If a worker is submitting a high threshold of invalid shares we can temporarily ban their IP
	 * to reduce system/network load. Also useful to fight against flooding attacks. If running
	 * behind something like HAProxy be sure to enable 'tcpProxyProtocol', otherwise you'll end up
	 * banning your own IP address (and therefore all workers).
	 */
	"banning": {
		"enabled": true,
		"time": 600, // how many seconds to ban worker for
		"invalidPercent": 50, // what percent of invalid shares triggers ban
		"checkThreshold": 500, // check invalid percent when this many shares have been submitted
		"purgeInterval": 300 // every this many seconds clear out the list of old bans
	},

	/**
	 * Each pool can have as many ports for your miners to connect to as you wish. Each port can
	 * be configured to use its own pool difficulty and variable difficulty settings. varDiff is
	 * optional and will only be used for the ports you configure it for.
	 */
	"ports": {
		[process.env.POOL_PORT]: { // a port for your miners to connect to
			"diff": 32, // the pool difficulty for this port

			/**
			 * Variable difficulty is a feature that will automatically adjust difficulty for
			 * individual miners based on their hashrate in order to lower networking overhead
			 */
			"varDiff": {
				"minDiff": 8, // minimum difficulty
				"maxDiff": 512, // network difficulty will be used if it is lower than this
				"targetTime": 15, // try to get 1 share per this many seconds
				"retargetTime": 90, // check to see if we should retarget every this many seconds
				"variancePercent": 30 // allow time to very this % from target without retargeting
			}
		},

		[process.env.POOL_PORT_NO_VARDIFF]: { // another port for your miners to connect to, this port does not use varDiff
			"diff": 256 // the pool difficulty
		}
	},

	/**
	 * Recommended to have at least two daemon instances running in case one drops out-of-sync
	 * or offline. For redundancy, all instances will be polled for block/transaction updates
	 * and be used for submitting blocks. Creating a backup daemon involves spawning a daemon
	 * using the "-datadir=/backup" argument which creates a new daemon instance with it's own
	 * RPC config. For more info on this see:
	 * https://en.bitcoin.it/wiki/Data_directory
	 * https://en.bitcoin.it/wiki/Running_bitcoind
	 */
	"daemons": [{
		"host": process.env.BLOQCOIN_HOST,
		"port": process.env.BLOQCOIN_PORT,
		"user": process.env.BLOQCOIN_USER,
		"password": process.env.BLOQCOIN_PASS
	}],

	/**
	 * This allows the pool to connect to the daemon as a node peer to receive block updates.
	 * It may be the most efficient way to get block updates (faster than polling, less
	 * intensive than blocknotify script). It requires the additional field "peerMagic" in the coin config.
	 */
	"p2p": {
		"enabled": true,
		"host": process.env.BLOQCOIN_HOST, // host for daemon
		"port": process.env.BLOQCOIN_PORT_P2P, // Port configured for daemon (this is the actual peer port not RPC port)

		/**
		 * If your coin daemon is new enough (i.e. not a shitcoin) then it will support a p2p
		 * feature that prevents the daemon from spamming our peer node with unnecessary
		 * transaction data. Assume its supported but if you have problems try disabling it.
		 */
		"disableTransactions": true,

		/**
		 * Magic value is different for main/testnet and for each coin. It is found in the daemon
		 * source code as the pchMessageStart variable.
		 * For example, litecoin mainnet magic: http://git.io/Bi8YFw
		 * And for litecoin testnet magic: http://git.io/NXBYJA
		 */
		"magic": "f9beb4d9"
	}
}, function(ip, workerName, password, callback) { // stratum authorization function

	console.log("Authorize " + workerName + ":" + password + "@" + ip);

	// store this workerName for payout
	
	callback({
		error: null,
		authorized: true,
		disconnect: false
	});
});

// open socket connection to frontend
/*
const socket = new WebSocket(process.env.WSS_URI_INTERNAL);
socket.binaryType = 'arraybuffer';

socket.onopen = async (e) => {

	console.log('[open] Connection established');

	//socket.close();
};
*/

/*
'data' object contains:
    job: 4, //stratum work job ID
    ip: '71.33.19.37', //ip address of client
    port: 3333, //port of the client
    worker: 'matt.worker1', //stratum worker name
    height: 443795, //block height
    blockReward: 5000000000, //the number of satoshis received as payment for solving this block
    difficulty: 64, //stratum worker difficulty
    shareDiff: 78, //actual difficulty of the share
    blockDiff: 3349, //block difficulty adjusted for share padding
    blockDiffActual: 3349 //actual difficulty for this block

    //AKA the block solution - set if block was found
    blockHash: '110c0447171ad819dd181216d5d80f41e9218e25d833a2789cb8ba289a52eee4',

    //Exists if "emitInvalidBlockHashes" is set to true
    blockHashInvalid: '110c0447171ad819dd181216d5d80f41e9218e25d833a2789cb8ba289a52eee4'

    //txHash is the coinbase transaction hash from the block
    txHash: '41bb22d6cc409f9c0bae2c39cecd2b3e3e1be213754f23d12c5d6d2003d59b1d,

    error: 'low share difficulty' //set if share is rejected for some reason
*/
pool.on('share', function(isValidShare, isValidBlock, data) {

	const obj = {};

	obj.data = {
		height: data.height, // block height
		blockReward: data.blockReward, // the number of satoshis received as payment for solving this block
		difficulty: data.difficulty, // stratum worker difficulty
		shareDiff: data.shareDiff, // actual difficulty of the share
		blockDiff: data.blockDiff, // block difficulty adjusted for share padding
		blockDiffActual: data.blockDiffActual, // actual difficulty for this block
		hashrate: util.getReadableHashRateString(pool.options.initStats.networkHashRate)
	};

    if (isValidBlock) {

		obj.message = 'Block found';
        console.log(obj.message);
	}
    else if (isValidShare) {

		obj.message = 'Valid share submitted';
        console.log(obj.message);
	}
    else if (data.blockHash) {

		obj.message = 'We thought a block was found but it was rejected by the daemon';
        console.log(obj.message);
	}
    else {

		obj.message = 'Invalid share submitted';
        console.log(obj.message);
	}

    //console.log('share data: ' + JSON.stringify(data));

	/*
	if (socket.readyState !== WebSocket.CLOSED) {
	
		socket.send(JSON.stringify(obj));
	}
	*/
});

/**
 * 'severity': can be 'debug', 'warning', 'error'
 * 'logKey':   can be 'system' or 'client' indicating if the error was caused by our system or a stratum client
 */
pool.on('log', function(severity, logKey, logText) {

	if (severity !== 'debug') {

		console.log(severity + ': ' + '[' + logKey + '] ' + logText);
	}
});

pool.start();