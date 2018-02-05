/* jslint node: true */
'use strict';

const PouchDB = require("pouchdb");
PouchDB.plugin(require('pouchdb-find'));

const config = require("../config.js");
const burstApi = require("../burstApi.js");

const accountsDB = new PouchDB(config.db.url + 'accounts', {
	auth: config.db.auth
});

const accUpdate = require("../blockCrons/account.js");

let startAccount = 0;

if(process.argv[2] > 0){
	startAccount = process.argv / 1;
}

/*
function syncPromise(arr, func, i){
	return func(arr[i])
	.then(response => {
		console.log(response);
		return syncPromise(arr, func, i+1)
	})
}
*/

function syncAccount(accounts, i){
	console.log(accounts[i].id + " account " + i + " of " + accounts.length);
	return accUpdate(accounts[i].id, false)
		.then(response => {
		console.log(response);
		return syncAccount(accounts, i+1);
	})
	.catch(err => {
		console.log(err);
		return syncAccount(accounts, i)
	})
}



function updateAccounts(){
	return accountsDB.allDocs()
	.then(response => {
		console.log(response);
		return syncAccount(response.rows, 0);
	})
	.catch(err => {
		console.log(err);
	})
}

updateAccounts();