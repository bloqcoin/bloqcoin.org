'use strict';

require('dotenv').config();

const express = require('express');
const expressStaticGzip = require('./middleware/compression.js');
const app = express();

// made sure node do not quit
process.on('uncaughtException', function (err) {
	console.error(err);
	console.log('Node NOT Exiting..');
});

/**
 * Simple API
 */
['/status',
 '/peers',
 '/blocks',
 '/stats',
 '/mempool',
 '/unconfirmed',
].forEach(endpoint => {
	const controller = require(`./controllers${endpoint}.js`);
	app.post(endpoint, new controller().get);
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

app.listen(process.env.PORT);