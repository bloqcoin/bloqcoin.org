'use strict';

const commands = module.exports.commands = [
	// hash-rate
	'getnetworkhashps',

	// peers
	'getpeerinfo',

	// blocks
	'getblockcount',
	'getblockhash',
	'getblockheader'
]

module.exports.isCommand = function(command) {
  command = command.toLowerCase()
  for (var i=0, len=commands.length; i<len; i++) {
    if (commands[i].toLowerCase() === command) {
        return true
    }
  }
}