'use strict';

import '../css/style.css';

import formatHighlight from 'json-format-highlight'

const pre = document.querySelector('pre');

pre.innerHTML = formatHighlight(pre.innerHTML, {
	keyColor: 'black',
	numberColor: 'blue',
	stringColor: '#0B7500',
	trueColor: '#00cc00',
	falseColor: '#ff8080',
	nullColor: 'cornflowerblue'
});