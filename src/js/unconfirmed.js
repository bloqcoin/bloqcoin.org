'use strict';

import '../css/style.css';
import '../css/table.css';

import 'jquery-reflow-table';

fetch('', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	}
})
.then(response => response.json())
.then(async (json) => {

	jQuery('.reflow-table').reflowTable();

	await Promise.all(json.map((transaction) => {

		const tr = jQuery('<tr>');

		jQuery('<td>', {
			text: transaction.address
		}).appendTo(tr);

		jQuery('<td>', {
			text: transaction.txid
		}).appendTo(tr);

		jQuery('<td>', {
			text: transaction.confirmations
		}).appendTo(tr);

		jQuery('<td>', {
			text: transaction.time
		}).appendTo(tr);		

		jQuery('table tbody').append(tr);
	}));

	jQuery('.reflow-table').reflowTable('update');
})
.catch(error => {

	console.log(error);
});