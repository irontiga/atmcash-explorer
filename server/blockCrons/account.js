'use strict';

const PouchDB = require("pouchdb");
PouchDB.plugin(require('pouchdb-find'));
//PouchDB.debug.enable('*');

const config = require("../config.js");
const burstApi = require("../burstApi.js");

const accountsDB = new PouchDB(config.db.url + 'accounts', {
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
	console.log(accID);
	return burstApi({
		requestType: "getAccount",
		account: accID
	})
        // Transaction count
        .then(accInfo => {
        //console.log(accInfo);
        return burstApi({
            requestType: "getAccountTransactionIds",
            account: accID
        })
            .then(transactionIds => {
            accInfo.totalTransactions = transactionIds.transactionIds.length;
            return Promise.resolve(accInfo);
        })
        // Trade count
        .then(accInfo => {
            return burstApi({
                requestType: "getTrades",
                account: accID
            })
                .then(trades => {
                accInfo.totalTrades = trades.trades.length;
                return Promise.resolve(accInfo);
            })
        })

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
		accInfo.forgedBalanceNQT = accInfo.forgedBalanceNQT / 1;
        //accInfo.effectiveName = accInfo.name ? accInfo.name: accInfo.accountRS;
		return Promise.resolve(accInfo);
	})
}

// 
module.exports = updateAccount;