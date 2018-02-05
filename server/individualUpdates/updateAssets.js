/* jslint node: true */
'use strict';

const PouchDB = require("pouchdb");
PouchDB.plugin(require('pouchdb-find'));

const config = require("../config.js");
const burstApi = require("../burstApi.js");

const assetsDB = new PouchDB(config.db.url + 'assets', {
	auth: config.db.auth
});

const assetFunction = require("../blockCrons/asset.js");
const orderFunctions = require("../blockCrons/asset-orders.js");

function syncAssets(assets, i){
	console.log("\n ------------------------------------------------------------");
	console.log("Updating " + assets[i].name + "(" + assets[i].asset + ", " + i + " of " + assets.length + ")")
	//return Promise.resolve("_______________")
	return orderFunctions.updateOrders(assets[i].asset)
	.then(response => {
		//console.log(response);
		return assetFunction.assetUpdate(assets[i].asset);
	})
	.then(response => {
		console.log(response);
		if(i == assets.length){
			return "Done";
		}
		return syncAssets(assets, i+1);
	})
	
}

function run(){
	return burstApi({
		requestType: "getAllAssets"
	})
		.then(assets => {
		assets = assets.assets;
		console.log(assets);
		return syncAssets(assets, 0);
	})
}

run().then(response => {
	console.log(response);
})
.catch(err => {
	console.log(err);
})