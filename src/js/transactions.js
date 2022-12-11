'use strict';

import '../css/style.css';
import '../css/table.css';

import 'jquery-reflow-table';

const txid = new URL(location.href).pathname.split('/')[2];

fetch('/tx', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	},
	body: JSON.stringify({
		txid: txid
	})
})
.then(response => response.json())
.then(async (json) => {

	jQuery('.reflow-table').reflowTable();

	const tr = jQuery('<tr>');
	
	jQuery('<td>', {
		text: json.height
	}).appendTo(tr);

	jQuery('<td>', {
		text: json.blockhash
	}).appendTo(tr);

	jQuery('<td>', {
		text: new Date(json.time * 1000).toLocaleDateString([], {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute:'2-digit'
		})
	}).appendTo(tr);

	jQuery('table tbody').append(tr);

	jQuery('.reflow-table').reflowTable('update');
})
.catch(error => {

	console.log(error);
});