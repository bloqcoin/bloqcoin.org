'use strict';

import '../css/style.css';

function notifyFrontend(obj) {

	const h3 = document.querySelector('h3');
	h3.innerHTML = obj.message;

	setTimeout(function() {

		h3.innerHTML = '&nbsp;';
	}, 4000);
}

const wss = new WebSocket(`${process.env.WSS_URI_EXTERNAL}/pool`);
wss.onmessage = function(e) {

	if (e.data instanceof Blob) {

		const reader = new FileReader();

		reader.onload = () => {

			notifyFrontend(JSON.parse(reader.result));
		};

		reader.readAsText(e.data);
	}
	else {

		notifyFrontend(JSON.parse(e.data));
	}
};

/**
 * We estimate the hashrate using the network difficulty
 * and the number of blocks found by each entity during a given period.
 * At the time of coding, the period we use is 100 blocks,
 */
fetch('', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	}
})
.then(response => response.json())
.then(json => {

	document.querySelector('h1').innerHTML = (Math.round(json.GH * 100) / 100).toFixed(2);
})
.catch(error => {

	console.log(error);
});

// get rate for Bloqcoin in EUR
fetch('https://api.bloqifi.com/v0/rates/BLOQ/EUR', {
	method: 'GET',
	headers: {
		'Content-Type': 'application/json'
	}
})
.then(response => response.json())
.then(json => {

	console.log(json)

	document.querySelector('h2').innerHTML = `${json.rate} EUR`;
})
.catch(error => {

	console.log(error);
});