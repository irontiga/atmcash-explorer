'use strict';

const PouchDB = require("pouchdb");
PouchDB.plugin(require('pouchdb-find'));

const burstApi = require("../burstApi.js");
const config = require("../config.js");

const assetsDB = new PouchDB(config.db.url + 'assets', {
	auth: config.db.auth
});
const assetOrdersDB = new PouchDB(config.db.url + 'asset-orders', {
	auth: config.db.auth
});

module.exports = {
	assetFromOrdersDB : assetFromOrdersDB,
	updateOrders : updateOrders,
	orderIndexes: orderIndexes
};

function assetFromOrdersDB(orderID){
	return assetOrdersDB.get(orderID);
}

/* 
--------------------------
UPDATE EVERY ORDER ACCOUNT 
--------------------------
*/

function updateOrders(assetID){
	return burstApi({
		requestType: "getAskOrders",
		asset: assetID
	})
		.then(askOrders => {
		
		if("errorCode" in askOrders){
			return Promise.reject("Ask order fetch error");
		}
		
		askOrders = askOrders.askOrders;
		//console.log(askOrders);
		return burstApi({
			requestType: "getBidOrders",
			asset: assetID
		}).then(bidOrders => {
			if("errorCode" in bidOrders){
				return Promise.reject("Bid order fetch error");
			}
			
			bidOrders = bidOrders.bidOrders;
			return Promise.resolve(askOrders.concat(bidOrders));
		})
	})
		.then(orders => {
		//console.log("Orders:");
		//console.log(orders);
		
		const orderPromises = [];
		
		orders.forEach(order => {
			order._id = order.order;
			order.quantityQNT = order.quantityQNT / 1;
			order.priceNQT = order.priceNQT / 1;
			delete order.order;
			
			orderPromises.push(
				assetOrdersDB.get(order._id)
				.then(oldOrder => {
					if(oldOrder.quantityQNT != order.quantityQNT){
						order._rev = oldOrder._rev;
						return assetOrdersDB.put(order);
					}
				}, err => {
					return assetOrdersDB.put(order);
				})
			)
		})
		
		return Promise.all(orderPromises);
		
		/*return assetOrdersDB.find({
			selector : {
				asset: { $eq: assetID }
			}
		})
			.then(oldOrders => {
			oldOrders = oldOrders.docs;
			//console.log("Order Orders");
			console.log(oldOrders);
			const orderPromises = [];
			
			orders.forEach(order => {
				var found = false;
				
				order.quantityQNT = order.quantityQNT / 1;
				order.priceNQT = order.priceNQT / 1;
				order._id = order.order;
				delete order.order;
				
				oldOrders.forEach((oldOrder, i, oldOrders) => {
					// Check if it already existed in the DB
					if(oldOrder._id == order._id){
						// FOUND IT!!! ;P
						found = true;
						//console.log("Old order found!");
						// Check if it needs to be updated
						if(oldOrder.quantityQNT != order.quantityQNT){
							
							order._rev = oldOrder._rev;
							
							orderPromises.push(
								assetOrdersDB.put(order)
								.catch(err => {
									console.log(order);
									console.log(err);
									return Promise.reject(err);
								})
							)
						}
						// No more need for you
						delete oldOrders[i];
					}
				})
				// If it wasn't found insert it fresh
				if(!found){
					//console.log("time to insert...");
					orderPromises.push(
						assetOrdersDB.put(order)
						.catch(err => {
							console.log("BRRRRRRRRRRRRRRRRRRRRRRRRRRRRr");
							console.log(order);
							console.log(err);
							return Promise.reject(err);
						})
					)
				}
			})
			
			// Old orders that didn't get deleted because they don't exist anymore
			oldOrders.forEach(oldOrder => {
				orderPromises.push(
					assetOrdersDB.remove(oldOrder)
				);
			})
			
			return Promise.all(orderPromises);
		})*/
	})
}

function orderIndexes(){
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
}
// 

