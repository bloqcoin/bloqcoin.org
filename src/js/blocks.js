'use strict';

import '../css/style.css';
import '../css/table.css';

import 'jquery-reflow-table';
import formatHighlight from 'json-format-highlight';

const block = new URL(location.href).pathname.split('/')[2];

fetch('/blocks', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	},
	body: JSON.stringify({
		block: block
	})
})
.then(response => response.json())
.then(async (json) => {

	jQuery('.reflow-table').reflowTable();

	if (json.length > 0) {

		await Promise.all(json.map((block) => {

			addToTable(block);
		}));
	}
	else {

		addToTable(json);

		const pre = document.querySelector('pre');

		pre.innerHTML = formatHighlight(json, {
			keyColor: 'black',
			numberColor: 'blue',
			stringColor: '#0B7500',
			trueColor: '#00cc00',
			falseColor: '#ff8080',
			nullColor: 'cornflowerblue'
		});
	}

	jQuery('.reflow-table').reflowTable('update');
})
.catch(error => {

	console.log(error);
});

const addToTable = (block) => {

	const tr = jQuery('<tr>');
			
	jQuery('<td>', {
		text: block.height
	}).appendTo(tr);

	jQuery('<td>', {
		text: block.merkleroot
	}).appendTo(tr);

	const blockHash = jQuery('<td>').appendTo(tr);

	jQuery('<a>', {
		text: block.hash,
		href: `/blocks/${block.hash}`
	}).appendTo(blockHash);

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
};