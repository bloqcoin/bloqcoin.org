'use strict';

/**
 * Return blockchain daemon
 * @returns {Object} object of blockchain daemon
 */
function getDaemon() {

	return require('../connections/socket.js')()
	.set('host', process.env.BLOQCOIN_HOST)
	.set('port', process.env.BLOQCOIN_PORT)
	.set('user', process.env.BLOQCOIN_USER)
	.set('pass', process.env.BLOQCOIN_PASS);
}

module.exports = {
	getDaemon
}