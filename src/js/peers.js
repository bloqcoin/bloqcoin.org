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

	await Promise.all(json.map((peer) => {

		const tr = jQuery('<tr>');
		
		jQuery('<td>', {
			text: peer.addr
		}).appendTo(tr);

		jQuery('<td>', {
			text: peer.subver
		}).appendTo(tr);

		jQuery('<td>', {
			text: peer.pingtime
		}).appendTo(tr);

		jQuery('table tbody').append(tr);
	}));

	jQuery('.reflow-table').reflowTable('update');
})
.catch(error => {

	console.log(error);
});