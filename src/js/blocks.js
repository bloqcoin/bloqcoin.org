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

	await Promise.all(json.map((block) => {

		const tr = jQuery('<tr>');
		
		jQuery('<td>', {
			text: block.height
		}).appendTo(tr);

		jQuery('<td>', {
			text: block.merkleroot
		}).appendTo(tr);

		jQuery('<td>', {
			text: block.hash
		}).appendTo(tr);

		jQuery('<td>', {
			text: new Date(block.time * 1000).toLocaleDateString([], {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute:'2-digit'
			})
		}).appendTo(tr);

		jQuery('table tbody').append(tr);
	}));

	jQuery('.reflow-table').reflowTable('update');
})
.catch(error => {

	console.log(error);
});