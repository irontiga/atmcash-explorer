const PouchDB = require("pouchdb");
PouchDB.plugin(require('pouchdb-find'));

const config = require("../config.js");

const blocksDB = new PouchDB(config.db.url + 'blocks', {
	auth: config.db.auth
});
/* Don't need transactions DB
const transactionsDB = new PouchDB(config.db.url + 'transactions', {
	auth: config.db.auth
});
*/
const assetsDB = new PouchDB(config.db.url + 'assets', {
	auth: config.db.auth
});
const assetTradesDB = new PouchDB(config.db.url + 'asset-trades', {
	auth: config.db.auth
});
const assetOrdersDB = new PouchDB(config.db.url + 'asset-orders', {
	auth: config.db.auth
});
const accountsDB = new PouchDB(config.db.url + 'accounts', {
	auth: config.db.auth
});

module.exports = compact;

function compact(){
	return blocksDB.compact()
		/* Don't need transactions DB
		.then(() => {
		return transactionsDB.compact();
	}) */
		.then(() => {
		return assetsDB.compact();
	})
		.then(() => {
		return assetTradesDB.compact();
	})
		.then(() => {
		return assetOrdersDB.compact();
	})
		.then(() => {
		return accountsDB.compact();
	})
}