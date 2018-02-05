'use strict';

const PouchDB = require("pouchdb");
PouchDB.plugin(require('pouchdb-find'));
//PouchDB.debug.enable('*');

const config = require("../config.js");
const burstApi = require("../burstApi.js");

const accountsDB = new PouchDB(config.db.url + 'accounts', {
	auth: config.db.auth
});
const assetsDB = new PouchDB(config.db.url + 'assets', {
	auth: config.db.auth
});
const transactionsDB = new PouchDB(config.db.url + 'transactions', {
	auth: config.db.auth
});

function updateAccount(accID, firstrun){
	// Insert the account
	return accountsDB.get(accID)
	//update
		.then(oldAcc => {
		if(firstrun){
			return Promise.resolve(accID + " already in DB");
		}
		// Update the doc
		return newAccInfo(accID)
		.then(accInfo => {
			//console.log(oldAcc);
			//console.log("Old account " + accInfo._id);
			accInfo._rev = oldAcc._rev;
			return accountsDB.put(accInfo)
				.catch(err => {
				console.log("HRHRHRHR");
				console.log(err);
				return Promise.reject(err);
			})
		})
		// or insert fresh
	}, err => {
		//console.log(err);
		//console.log("New account " + accInfo._id);
		return newAccInfo(accID)
		.then(accInfo => {
			return accountsDB.put(accInfo)
				.catch(err => {
				console.log("New acc err");
				console.log(err);
				return Promise.reject(err);
			})
		})
	});
}

function newAccInfo(accID){
	//console.log(accID);
	return burstApi({
		requestType: "getAccount",
		account: accID
	})
		.then(accInfo => {
		//console.log(accInfo.account);

		if("errorCode" in accInfo){
			console.log(accInfo);
			return Promise.reject(accInfo);
		}

		accInfo._id = accInfo.account;
		delete accInfo.account;
		// Convert em to numbers, for sorting
		accInfo.unconfirmedBalanceNQT = accInfo.unconfirmedBalanceNQT / 1;
		accInfo.guaranteedBalanceNQT = accInfo.guaranteedBalanceNQT / 1;
		accInfo.balanceNQT = accInfo.balanceNQT / 1;

		var assetWait;

		// If no assets...
		if(!("assetBalances" in accInfo)){
			assetWait = Promise.resolve([]);
		}
		else{
			// A wee bit of asset info
			assetWait = Promise.all(accInfo.assetBalances.map(asset => {
				return assetsDB.get(asset.asset)
					.then(assetInfo => {
					//console.log("|||||||||||||||||||||||| GET DAT ASSET " + asset.asset);
					// Name and last trade price
					asset.name = assetInfo.name;
					asset.decimals = assetInfo.decimals;
					asset.quantityQNT = assetInfo.quantityQNT;
					/*asset.lowestAsk = assetInfo.lowestAsk.priceNQT / 100000000 * Math.pow(10, asset.decimals);
					asset.highestBid = assetInfo.highestBid.priceNQT / 100000000 * Math.pow(10, asset.decimals);
					if(assetInfo.recentTrades.length > 0){
						asset.price = assetInfo.recentTrades[0].priceNQT;
					}
					else{
						asset.price = 0;
					}*/
					return Promise.resolve(asset);
				})
					.catch(err => {
					//console.log(err);
					//console.log("No asset (yet..?) " + asset.asset);
					return Promise.resolve(asset);
				})
			}))
		}

		return assetWait.then(assetBalances => {
			//console.log(assetBalances);
			accInfo.assetBalances = assetBalances;
			
			return burstApi({
				requestType: "getAliases",
				account: accInfo._id
			})
				.then(aliases => {
				if("errorCode" in aliases){
				}
				
				aliases = aliases.aliases;
				
				aliases.forEach((alias, i, aliases) => {
					delete aliases[i].accountRS;
					delete aliases[i].account;
				})
				
				accInfo.aliases = aliases;
				
				// Get the most recent transactions
				// Easiest to use the burstApi to fetch the top transactions, rather than the DB
				return burstApi({
					requestType: "getAccountTransactions",
					account: accInfo._id,
					firstIndex: 0,
					lastIndex: 20
				})
			})
				.then(transactions => {
				if("errorCode" in transactions){
					return Promise.reject(transactions);
				}

				transactions = transactions.transactions;

				transactions.forEach((tx, i, transactions) => {
					delete tx.senderPublicKey;
					delete tx.signature;
					delete tx.fullHash;
					delete tx.version;
					delete tx.ecBlockId;
					delete tx.signatureHash;
					// Uhh, they're handy for the links
					//delete tx.sender;
					//delete tx.recipient;
					delete tx.block;
					delete tx.blockTimestamp;
					delete tx.deadline;
					delete tx.height;
					// No use, changes every block
					delete tx.confirmations;

					transactions[i] = tx;
				});

				accInfo.transactions = transactions;
				
				return Promise.resolve(accInfo);
			})
		})
	})
}

// 
module.exports = updateAccount;