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

		const ping = (Math.round((peer.pingtime * 1000) * 100) / 100).toFixed(3);

		const tr = jQuery('<tr>');
		
		jQuery('<td>', {
			text: peer.addr
		}).appendTo(tr);

		jQuery('<td>', {
			text: peer.subver
		}).appendTo(tr);

		jQuery('<td>', {
			text: `${ping} ms`
		}).appendTo(tr);

		jQuery('table tbody').append(tr);
	}));

	jQuery('.reflow-table').reflowTable('update');
})
.catch(error => {

	console.log(error);
});