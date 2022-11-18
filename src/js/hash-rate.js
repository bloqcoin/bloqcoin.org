'use strict';

import '../css/style.css';
import '../css/table.css';

import 'jquery-reflow-table';

function notifyFrontend(obj) {

	if (obj.data.height) {

		jQuery('.reflow-table').reflowTable();

		const tr = jQuery('<tr>');
			
		jQuery('<td>', {
			text: obj.data.height
		}).appendTo(tr);

		jQuery('<td>', {
			text: obj.message
		}).appendTo(tr);

		jQuery('<td>', {
			text: obj.data.difficulty
		}).appendTo(tr);

		jQuery('<td>', {
			text: new Date().toLocaleDateString([], {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute:'2-digit'
			})
		}).appendTo(tr);

		jQuery('table tbody').prepend(tr);

		jQuery('.reflow-table').reflowTable('update');

		// set hash rate
		const hashRate = document.querySelector('h1');
		hashRate.innerHTML = obj.data.hashrate;
		hashRate.classList.remove('hash-rate');
	}

	if (obj.data.severity) {

		console.log(obj);
	}
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

// get rate for Bloqcoin in EUR
fetch('https://api.bloqifi.com/v0/rates/BLOQ/EUR', {
	method: 'GET',
	headers: {
		'Content-Type': 'application/json'
	}
})
.then(response => response.json())
.then(json => {

	document.querySelector('h2').innerHTML = `${json.rate} EUR`;
})
.catch(error => {

	console.log(error);
});