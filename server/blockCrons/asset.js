/* jslint node: true */
'use strict';

const PouchDB = require("pouchdb");
PouchDB.plugin(require('pouchdb-find'));

const config = require("../config.js");
const burstApi = require("../burstApi.js");

const assetsDB = new PouchDB(config.db.url + 'assets', {
	auth: config.db.auth
});
const assetTradesDB = new PouchDB(config.db.url + 'asset-trades', {
	auth: config.db.auth
});
const assetOrdersDB = new PouchDB(config.db.url + 'asset-orders', {
	auth: config.db.auth
});

const tradeHelpers = require("./asset-trades-helpers.js");

module.exports = {
	//assetFromOrder: assetFromOrder,
	assetUpdate: assetUpdate
}
/*
function assetFromOrder(type, orderID){
	return burstApi({
		requestType: "get" + type + "Order",
		order: orderID
	})
	.then(order => {
		return order.asset;
	})
}*/

function assetUpdate(assetID){
	
	return assetsDB.get(assetID)
	// Asset exists, let's update it
	.then(assetInfo => {
		//console.log(assetInfo);
		return getNewAssetInfo(assetInfo)
			.then(newAssetInfo => {
			//console.log("Inserting asset................");
			newAssetInfo._rev = assetInfo._rev;
			return assetsDB.put(newAssetInfo)
				.then(response => {
				//console.log(assetID);
				//console.log(response);
                return Promise.resolve(response)
			},err => {
				//console.log(assetID);
				console.log("Asset errr");
				//console.log(newAssetInfo);
				return Promise.reject(err);
			})
		})
		
	// Asset does not yet exist, let's insert it fresh
	}, err => {
		return burstApi({
			requestType: "getAsset",
			asset: assetID
		})
			.then(assetInfo => {
			if("errorCode" in assetInfo){
				console.log(assetInfo);
				return Promise.reject(assetInfo);
			}

			//console.log(assetInfo);
			assetInfo._id = assetInfo.asset;
			delete assetInfo.asset;
			return getNewAssetInfo(assetInfo);
		})
			.then(newAssetInfo => {
			//console.log(newAssetInfo);
			return assetsDB.put(newAssetInfo);
		})
	})
}

function getNewAssetInfo(assetInfo){
	const newAssetInfo = assetInfo;
	//console.log("Gettings new asset info");
	// 20 most recent trades
	/*return assetTradesDB.find({
		selector : {
			asset: { $eq: assetInfo._id},
			timestamp : { $gt : null }
		},
		sort : [
			{ timestamp : "desc" }
		]
	})*/
	return burstApi({
		requestType: "getTrades",
		asset: assetInfo._id,
		includeAssetInfo: false
	})
	// 20 most recent trades
	.then(trades => {
		//trades = trades.docs;
		trades = trades.trades;
		
		if(trades.length == 0){
			
			newAssetInfo.candlestickChart = [];
			newAssetInfo.volumeChart = [];

			newAssetInfo.recentTrades = [];

			newAssetInfo.dailyVolume = 0;
			newAssetInfo.weeklyVolume = 0;
			newAssetInfo.monthlyVolume = 0;

			//newAssetInfo.lastTrade = {};
            
            newAssetInfo.numberOfTrades = 0;
		}
		else{
			
			const lastTrade = trades[0];

			const charts = tradeHelpers.chartData(trades.slice(), assetInfo);
			newAssetInfo.candlestickChart = charts.candlestickChart;
			newAssetInfo.volumeChart = charts.volumeChart;
			
			const volumes = tradeHelpers.volumes(trades.slice(), assetInfo);
			
			newAssetInfo.dailyVolume = volumes.dailyVolume;
			newAssetInfo.weeklyVolume = volumes.weeklyVolume;
			newAssetInfo.monthlyVolume = volumes.monthlyVolume;

            newAssetInfo.numberOfTrades = trades.length;
            
			/*newAssetInfo.recentTrades = trades.slice(0,20).map(trade => {
				//return trade;

				return {
					tradeType: trade.tradeType,
					priceNQT: trade.priceNQT,
					buyerRS: trade.buyerRS,
					quantityQNT: trade.quantityQNT,
					sellerRS: trade.sellerRS,
					seller: trade.seller,
					timestamp: trade.timestamp,
					buyer: trade.buyer
				}
			});*/
			
			//newAssetInfo.lastTrade = lastTrade;
		}
		
		/*newAssetInfo.recentTrades.forEach((trade, i, trades) => {
			trades[i].priceNQT = trade.priceNQT / 1;
			trades[i].quantityQNT = trade.quantityQNT / 1;
		});'*/
		//return Promise.resolve("Skip trades")
		
		return burstApi({
			requestType: "getAskOrders",
			asset: newAssetInfo._id
		})
		
		.then(askOrders => {
			if("errorCode" in askOrders){
				return Promise.reject(askOrders);
			}
			
			askOrders = askOrders.askOrders;
			
			newAssetInfo.askOrders = askOrders.map(ask => {
				return {
					"priceNQT": ask.priceNQT,
					"quantityQNT": ask.quantityQNT
				}
			});
			
			newAssetInfo.lowestAsk = askOrders[0];
			
			return burstApi({
				requestType: "getBidOrders",
				asset: newAssetInfo._id
			})
			
		})
		.then(bidOrders => {
			if("errorCode" in bidOrders){
				return Promise.reject(bidOrders);
			}

			bidOrders = bidOrders.bidOrders;

			newAssetInfo.bidOrders = bidOrders.map(bid => {
				return {
					"priceNQT": bid.priceNQT,
					"quantityQNT": bid.quantityQNT
				}
			});
			
			newAssetInfo.highestBid = bidOrders[0];
			
			return burstApi({
				requestType: "getTransaction",
				transaction: newAssetInfo._id
			})
			
		})
		
		.then(issuingTransaction => {
			if("errorCode" in issuingTransaction){
				return Promise.reject(issuingTransaction);
			}
			newAssetInfo.issuingTransaction = issuingTransaction;
			return Promise.resolve(newAssetInfo);
		})
		
		/*
		
		// Ask orders
		return assetOrdersDB.find({
			selector: {
				asset : { $eq: newAssetInfo._id },
				type : { $eq : "ask" },
				priceNQT : { $gt : null }
			},
			sort : [
				{ priceNQT : "asc" }
			],
			limit : 10
		})
			.then(askOrders => {
			askOrders = askOrders.docs;
			//console.log(askOrders);
			newAssetInfo.lowestAsk = askOrders[0];
			
			newAssetInfo.askOrders = askOrders.map(askOrder => {
				delete askOrder.account;
				delete askOrder.height;
				return askOrder;
			});
			
		// Bid orders
			return assetOrdersDB.find({
				selector: {
					asset : { $eq: newAssetInfo._id },
					type : { $eq : "bid" },
					priceNQT : { $gt : null }
				},
				sort : [
					{ priceNQT : "desc" }
				],
				limit : 10
			})
		})
			.then(bidOrders => {
			bidOrders = bidOrders.docs;
			//console.log(bidOrders);
			newAssetInfo.topBid = bidOrders[0];
			
			newAssetInfo.bidOrders = bidOrders.map(bidOrder => {
				delete bidOrder.account;
				delete bidOrder.height;
				return bidOrder;
			});
			
			return Promise.resolve(newAssetInfo);
		})*/
	})
}
function insertAsset(asset){
	
}