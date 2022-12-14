'use strict';

const commands = module.exports.commands = [
	// peers
	'getpeerinfo',

	// blocks
	'getblockcount',
	'getblockhash',
	'getblockheader',

	// tx
	'getrawtransaction'
]

module.exports.isCommand = function(command) {
  command = command.toLowerCase()
  for (var i=0, len=commands.length; i<len; i++) {
    if (commands[i].toLowerCase() === command) {
        return true
    }
  }
}