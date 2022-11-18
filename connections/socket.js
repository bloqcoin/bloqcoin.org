'use strict';

const net = require('node:net');

var api  = require('./commands.js'), errors = require('./errors.js');

function Client(options) { 
    this.opts = {
		host: '127.0.0.1',
		port: 1337,
		method: 'POST',
		user: '',
		pass: '',
		headers:  {
			'Host': 'localhost',
			'Authorization':  ''
		},
		passphrasecallback: null,
		https: false,
		ca: null
    };

	if (options) {

		this.set(options);
    }
}

Client.prototype = {

	invalid: function(command) {
		
		var args = Array.prototype.slice.call(arguments, 1),
		fn = args.pop();
		
		if (typeof fn !== 'function') {
			
			fn = console.error;
		}

        return fn(new Error('No such command "' + command  + '"'));
    },

    send: function(command) {
        var args = Array.prototype.slice.call(arguments, 1), self = this, fn;
        
        if (typeof args[args.length-1] === 'function') {

            fn = args.pop().bind(this)
        } else {

            fn = console.error
        }

        var request = JSON.stringify({
            jsonrpc: '2.0',
			method: command.toLowerCase(),
			params: args,
			id: new Date().getTime(),
		})

		let input = "POST / HTTP/1.1\r\n";
		input += 'Host: ' + this.opts.headers['Host'] + "\r\n";
		input += 'Authorization: ' + this.opts.headers['Authorization'] + "\r\n";
		input += "Content-Type: application/json\r\n";
		input += `Content-Length: ${request.length}\r\n`;
		input += "Connection: Close\r\n\r\n";
		input += request;

		var data = '';

		const client = net.createConnection({ port: this.opts.port, host: this.opts.host }, () => {

			client.write(input);
		});

		client.on('error', function(err) {
			
			return fn(new Error(err));
		});

		client.on('data', (chunk) => {

			data += chunk;
		});

		client.on('end', () => {

			/**
			 * Raw header and body
			 */
			var splitArray = data.split("\r\n\r\n");
			var headers = splitArray[0].split(/\r?\n|\r|\n/g);
			var body = splitArray[1];

			try {

				data = JSON.parse(body);
			}
			catch (exception) {
			
				var errMsg = headers[0] !== 'HTTP/1.1 200 OK' ? 'Invalid params ' + headers[0] : 'Failed to parse JSON';
			
				errMsg += ' : ' + JSON.stringify(data);
			
				return fn(new Error(errMsg));
			}

			if (data.error) {
			
				if (data.error.code === errors.RPC_WALLET_UNLOCK_NEEDED && options.passphrasecallback) {
					
					return self.unlock(command, args, fn);
				}
				else {
					
					var err = new Error(JSON.stringify(data));
					err.code = data.error.code;
					return fn(err);
				}
			}

			fn(null, data.result !== null ? data.result : data);
		});

        return this;
    },

    exec: function(command) {
        var func = api.isCommand(command) ? 'send' : 'invalid'
        return this[func].apply(this, arguments)
    },

	auth: function(user, pass) {
        if (user && pass) {
            var authString = ('Basic ') + Buffer.from(user+':'+pass).toString('base64');
            this.opts.headers['Authorization'] = authString
        }
      return this
    },

    unlock: function(command, args, fn) {
      var self = this

      var retry = function(err) {
        if (err) {
          fn(err)
        } else {
          var sendargs = args.slice();
          sendargs.unshift(command);
          sendargs.push(fn)
          self.send.apply(self, sendargs)
        }
      }

      this.opts.passphrasecallback(command, args, function(err, passphrase, timeout) {
        if (err) {
          fn(err)
        } else {
          self.send('walletpassphrase', passphrase, timeout, retry)
        }
      })
    },

	set: function(k, v) {

		if (typeof(k) === 'object') {

			for (var key in k) {

				this.set(key, k[key]);
			};
	
			return;
	
		};

		var opts = this.opts;
		var k = k.toLowerCase();

		if (opts.hasOwnProperty(k)) {
	
			opts[k] = v;
	
			if (/^(user|pass)$/.test(k)) {
	
				this.auth(opts.user, opts.pass);
			}
			else if (k === 'host') {
	
				opts.headers['Host'] = v;
			}
			else if (k === 'passphrasecallback' || k === 'https' || k === 'ca') {

				opts[k] = v;
			}
		}

		return this;
	},

	get: function(k) {

		if (this.opts[k] === false){
			
			return false;
		}
		else {

			return this.opts[k.toLowerCase()];
		}
	},

    errors: errors
}

api.commands.forEach(function(command) {
    var cp  = Client.prototype;
    var tlc = [command.toLowerCase()];

    cp[command] = cp[tlc] = function() {

        cp.send.apply(this, tlc.concat(([]).slice.call(arguments)));
    };
})

module.exports = function(options) {
    return new Client(options)
}