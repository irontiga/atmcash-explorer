/* jslint node: true */
'use strict';

const PouchDB = require("pouchdb");
PouchDB.plugin(require('pouchdb-find'));

const config = require("../config.js");
const burstApi = require("../burstApi.js");

const tradesDB = new PouchDB(config.db.url + 'asset-trades', {
	auth: config.db.auth
});

const updateTrades = require("../blockCrons/trades.js");

function run(){
	return updateTrades()
	.then(response => {
		console.log(response);
		run();
	}, err => {
		console.log(err);
		run();
	})
}


run();