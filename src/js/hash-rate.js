'use strict';

import '../css/style.css';

fetch('', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	}
})
.then(response => response.json())
.then(json => {

	document.querySelector('h1').innerHTML = (Math.round(json.MH * 100) / 100).toFixed(2);
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