'use strict';

require('dotenv').config();

const express = require('express');
const expressStaticGzip = require('./middleware/compression.js');
const ws = require('ws');
const app = express();

// made sure node do not quit
process.on('uncaughtException', function (err) {
	console.error(err);
	console.log('Node NOT Exiting..');
});

/*-------------------------------------
	WebSocket
---------------------------------------*/
const wsServer = new ws.Server({
	noServer: true,
	perMessageDeflate: {
		zlibDeflateOptions: {
			chunkSize: 1024,
			memLevel: 7,
			level: 3,
		},
		zlibInflateOptions: {
			chunkSize: 10 * 1024
		},
		clientNoContextTakeover: true, // Defaults to negotiated value.
		serverNoContextTakeover: true, // Defaults to negotiated value.
		serverMaxWindowBits: 10, // Defaults to negotiated value.
		// Below options specified as default values.
		concurrencyLimit: 10, // Limits zlib concurrency for perf.
		threshold: 1024, // Size (in bytes) below which messages should not be compressed.
	}
});

const clients = [];

wsServer.on('connection', (ws, req) => {

    id = Math.random();
    clients[id] = ws;
    clients.push(ws);

	console.log(`connection is established : ${id}`);

	ws.on('close', () => {

		console.log(`connection ${id} closed`);
		delete clients[id];
	});

	ws.on('message', message => {

		clients.forEach(function(client) {

			console.log(client.id);

			client.send(message);
		});
	});
});

/**
 * Simple API
 */
['/hash-rate',
 '/peers',
 '/blocks',
 '/tx'
].forEach(endpoint => {
	const cors = require('cors');
	app.use(cors());

	const bodyParser = require('body-parser');
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());

	const controller = require(`./controllers${endpoint}.js`);
	app.post(endpoint, new controller().get);
});

app.get('/tx/:TXID', (req, res) => {
	res.sendFile('./dist/tx.html', {root: __dirname});
});

app.get('/health', (req, res) => {
	const os = require('os');
	const avg_load = os.loadavg();

	// server has capacity
	if (avg_load[1] < 30) {
		return res.status(200).send('ok');
	}

	return res.status(400).send('server is overloaded');
});

app.use('/', expressStaticGzip());
app.use('*', (req, res) => {
	res.status(404).json({
		message: 'Page not found'
	});
});

// `server` is a vanilla Node.js HTTP server, so use
// the same ws upgrade process described here:
// https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
const server = app.listen(process.env.PORT);

server.on('upgrade', (request, socket, head) => {

	wsServer.handleUpgrade(request, socket, head, socket => {

		wsServer.emit('connection', socket, request);
	});
});