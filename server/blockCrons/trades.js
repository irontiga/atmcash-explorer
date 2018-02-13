'use strict';

const PouchDB = require("pouchdb");
PouchDB.plugin(require('pouchdb-find'));

const burstApi = require("../burstApi.js");
const config = require("../config.js");

const assetsDB = new PouchDB(config.db.url + 'assets', {
	auth: config.db.auth
});
const assetTradesDB = new PouchDB(config.db.url + 'asset-trades', {
	auth: config.db.auth
});

function updateTrades(){
	
	return assetTradesDB.info()
		.then(info => {
		//console.log(info);
		return burstApi({
			requestType: "getState"
		})
			.then(state => {
			if((state.numberOfTrades + 2) == info.doc_count){
				console.log("Nooooo new trades i hope");
				return Promise.resolve({trades:[]});
			}
			//console.log(state);
			return burstApi({
				requestType: "getAllTrades",
				firstIndex: state.numberOfTrades - info.doc_count + 2 - 50, // -2 cause of indexes being counted as docs
				lastIndex: state.numberOfTrades - info.doc_count + 2,
				includeAssetInfo: true
			});
		})
	})
	
		.then(trades => {
		if("errorCode" in trades){
			console.log(trades);
			return Promise.reject(trades);
		}
		
		trades = trades.trades;
		//console.log(trades);
		if(trades.length == 0){
			return Promise.resolve("No new trades");
		}
		trades.forEach((trade, i, trades) => {
			trades[i].priceNQT = trade.priceNQT / 1;
			trades[i].quantityQNT = trade.quantityQNT / 1;
			trades[i]._id = trade.bidOrder + trade.askOrder;
		})
		
		return Promise.all(trades.map(trade => {
			return assetTradesDB.put(trade)
			.catch(err => {
				console.log("trade put err");
				//console.log(err);
				if(err.error == 'conflict'){
					return Promise.resolve(err);
				}
				else{
					Promise.reject(err);
				}
			})
		}))
	})
}

// 

module.exports = updateTrades;


function tradeIndexes(){
	return assetTradesDB.createIndex({
		index: {
			fields: ['timestamp']
		}
	})
		.then(response => {
		return assetTradesDB.createIndex({
			index: {
				fields: ['asset']
			}
		})
	})
		.then(response =>{
		return assetTradesDB.compact();
	})
}