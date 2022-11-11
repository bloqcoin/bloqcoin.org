'use strict';

/**
 * Return blockchain daemon
 * @returns {Object} object of blockchain daemon
 */
function getDaemon() {

	const parseDbUrl = require('parse-database-url');
	const nodeConfig = parseDbUrl(process.env.BLOQCOIN_URI);

	return require('../connections/socket.js')()
	.set('host', nodeConfig.host)
	.set('port', nodeConfig.port)
	.set('user', nodeConfig.user)
	.set('pass', nodeConfig.password);
}

module.exports = {
	getDaemon
}