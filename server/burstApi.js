'use strict';

const config = require("./config.js");
const http = require("http");
const https = require("https");

function burstApi(options) {

	const urlParams = Object.keys(options).map(function (k) {
		return encodeURIComponent(k) + "=" + encodeURIComponent(options[k]);
	}).join('&');

	const requestOptions = {
		host: config.wallet.host,
		port: config.wallet.port,
		path: '/burst?' + urlParams,
		method: 'POST'
	};
	
	var protocol;
	
	if(config.wallet.protocol == "https"){
		protocol = https;
	}else{
		protocol = http;
	}
	
	
	return new Promise(function (fulfill, reject) {
		const response = [];
		protocol.request(requestOptions, function (res) {
			res.setEncoding('utf8');
			res.on('data', (chunk) => response.push(chunk));
			res.on('end', () => {
				const parsedResponse = JSON.parse(response.join(''));
				fulfill(parsedResponse);
			})
		}).end();
	});
}

module.exports = burstApi;

