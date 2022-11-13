'use strict';

const commands = module.exports.commands = [
	// status
	'getnetworkhashps',

	// peers
	'getpeerinfo',

	// blocks
	'getblockcount',
	'getblockhash',
	'getblockheader',

	// stats
	'getnetworkinfo',

	// mempool
	'getmempoolinfo',

	// unconfirmed
	'listtransactions'
]

module.exports.isCommand = function(command) {
  command = command.toLowerCase()
  for (var i=0, len=commands.length; i<len; i++) {
    if (commands[i].toLowerCase() === command) {
        return true
    }
  }
}