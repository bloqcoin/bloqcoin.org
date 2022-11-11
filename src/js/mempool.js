'use strict';

import '../css/style.css';

import formatHighlight from 'json-format-highlight'

fetch('', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	}
})
.then(response => response.json())
.then(json => {

	document.querySelector('pre').innerHTML = formatHighlight(json, {
		keyColor: 'black',
		numberColor: 'blue',
		stringColor: '#0B7500',
		trueColor: '#00cc00',
		falseColor: '#ff8080',
		nullColor: 'cornflowerblue'
	});
})
.catch(error => {

	console.log(error);
});