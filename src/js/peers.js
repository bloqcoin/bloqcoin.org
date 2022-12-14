'use strict';

import '../css/style.css';
import '../css/table.css';
import '../css/leaflet.css';
import '../css/peers.css';

import 'jquery-reflow-table';
import 'leaflet';

// init map of peers
const map = L.map('map').setView([35.90657261357048, -39.84550311312221], 2);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	minZoom: 2,
	maxZoom: 5
}).addTo(map);

// fetch peers
fetch('/peers', {
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
			text: peer.country
		}).appendTo(tr);

		jQuery('<td>', {
			text: peer.city
		}).appendTo(tr);		

		jQuery('<td>', {
			text: peer.timezone
		}).appendTo(tr);

		jQuery('<td>', {
			text: `${(Math.round((peer.pingtime * 1000) * 100) / 100).toFixed(3)} ms`
		}).appendTo(tr);

		jQuery('table tbody').append(tr);

		try {
			// add peer to map
			L.circle([peer.ll[0], peer.ll[1]], {
				color: 'red',
				fillColor: '#f03',
				fillOpacity: 0.5,
				radius: 500
			}).addTo(map);
		}
		catch {}
	}));

	jQuery('.reflow-table').reflowTable('update');
})
.catch(error => {

	console.log(error);
});