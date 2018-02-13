const PouchDB = require("pouchdb");
PouchDB.plugin(require('pouchdb-find'));

const config = require("../config.js");

const blocksDB = new PouchDB(config.db.url + 'blocks', {
	auth: config.db.auth
});
///* Don't need transactions DB
const transactionsDB = new PouchDB(config.db.url + 'transactions', {
	auth: config.db.auth
});
//*/
const assetsDB = new PouchDB(config.db.url + 'assets', {
	auth: config.db.auth
});
///*
const assetTradesDB = new PouchDB(config.db.url + 'asset-trades', {
	auth: config.db.auth
});
//*/
const assetOrdersDB = new PouchDB(config.db.url + 'asset-orders', {
	auth: config.db.auth
});
const accountsDB = new PouchDB(config.db.url + 'accounts', {
	auth: config.db.auth
});

module.exports = index;

function index(){
	// Orders
	return assetOrdersDB.createIndex({
		index: {
			fields: ['priceNQT']
		}
	})
		.then(response => {
		return assetOrdersDB.createIndex({
			index: {
				fields: ['type']
			}
		})
	})
		.then(response => {
		return assetOrdersDB.createIndex({
			index: {
				fields: ['asset']
			}
		})
	})
	
	// Trades
    ///*
		.then(response => {
		return assetTradesDB.createIndex({
			index: {
				fields: ['timestamp']
			}
		})
	})
		.then(response => {
		return assetTradesDB.createIndex({
			index: {
				fields: ['asset']
			}
		})
	})
    //*/
	
	// Assets
	.then(response => {
		return assetsDB.createIndex({
			index: {
				fields: ["name"]
			}
		})
	})
		.then(response => {
		return assetsDB.createIndex({
			index: {
				fields: ["monthlyVolume"]
			}
		})
	})
		.then(response => {
		return assetsDB.createIndex({
			index: {
				fields: ["weeklyVolume"]
			}
		})
	})
		.then(response => {
		return assetsDB.createIndex({
			index: {
				fields: ["dailyVolume"]
			}
		})
	})
		.then(response => {
		return assetsDB.createIndex({
			index: {
				fields: ["numberOfTrades"]
			}
		})
	})
	
	// Accounts
		.then(response => {
		return accountsDB.createIndex({
			index: {
                fields: ["_id", "name", "accountRS"]
			}
		})
	})
        /*.then(response => {
		return accountsDB.createIndex({
			index: {
				fields: ["effectiveName"]
			}
		})
	})*/
		.then(response => {
        console.log("===============================================================")
        console.log(response);
		return accountsDB.createIndex({
			index: {
				fields: ["balanceNQT"]
			}
		})
	})
		.then(response => {
		return accountsDB.createIndex({
			index: {
				fields: ["forgedBalanceNQT"]
			}
		})
	})
	
	// Transactions
	///* Don't need transactions DB
		.then(response => {
		return transactionsDB.createIndex({
			index: {
				fields: ["sender", "recipient"]
			}
		})
	})
		.then(response => {
		return transactionsDB.createIndex({
			index: {
				fields: ["timestamp"]
			}
		})
	})
	//*/
	
	// Blocks
		.then(response => {
		return blocksDB.createIndex({
			index: {
				fields: ["height"]
			}
		})
	})
}