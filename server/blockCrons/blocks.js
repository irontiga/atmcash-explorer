'use strict';

const PouchDB = require("pouchdb");
PouchDB.plugin(require('pouchdb-find'));


const config = require("../config.js");
const burstApi = require("../burstApi.js");

const blocksDB = new PouchDB(config.db.url + 'blocks', {
	auth: config.db.auth
});

///* Don't need transactions DB
const transactionsDB = new PouchDB(config.db.url + 'transactions', {
	auth: config.db.auth
});
//*/

const assetFunctions = require("./asset.js");
const assetTrades = require("./trades.js");
const accFunction = require("./account.js");
const orderFunctions = require("./asset-orders.js");

module.exports = eachBlock;

function eachBlock(firstrun){
	console.log("Block: ");
	// Get last stored block in DB
	return blocksDB.info()
		.then(info => {
		
		info.doc_count = info.doc_count - 1;
		console.log(info.doc_count);

		//Fetch block with ^^ height
		return burstApi({
			requestType: "getBlock",
			height: info.doc_count,
			includeTransactions: true // Not to be stored, just to check for accounts/assets etc.
		})
	})
		.then(block => {
		// Return if block doesn't exist
		if("errorCode" in block){
			return Promise.reject("No new block");
		}
		
		// Store just the IDs (to be inserted into blocksDB)
		const transactionsForBlock = [];
		const blockPromises = [];
		// Has errors if the same account is being updated at the same time... no need to anyway
		const accountsUpdatedThisBlock = [];
		// Assets which have been updated this block and therefor don't need to be updated again
		const updatedAssets = [];
		
		// tx is much shorter than transaction...
		block.transactions.forEach(tx => {
			tx._id = tx.transaction;
			delete tx.transaction;
			
			//console.log(tx);
			///* No need for tx.'s in DB
			blockPromises.push(
				transactionsDB.put(tx)
				.then(response => {
					return Promise.resolve("Tx inserted (" + tx._id + ")");
				}, err => {
					//console.log("TX ERROROROROR");
					//console.log(err);
					return Promise.resolve("TX " + tx._id + " wasn't inserted");
				})
			);
			//*/
			
			if("sender" in tx){
				// Update the account...
				if(accountsUpdatedThisBlock.indexOf(tx.sender) == -1){
					accountsUpdatedThisBlock.push(tx.sender);
                    blockPromises.push(
						accFunction(tx.sender, firstrun)
					);
				}
			}
			if("recipient" in tx){
				// Update the account...
				if(accountsUpdatedThisBlock.indexOf(tx.recipient) == -1){
					accountsUpdatedThisBlock.push(tx.recipient);
					blockPromises.push(
						accFunction(tx.recipient, firstrun)
					);
				}
			}
			
			// If first run we can skip asset updates etc.
			if(!firstrun){
				// Coloured coins (yes, coloured, I'm not American, sorry Trump)
				if(tx.type === 2){
					// Assets...
					switch(tx.subtype){
						case 0:
							// Asset issuance. Asset gets tx ID for it's asset ID, so...
							// tx ID stored under "transaction"
							if(updatedAssets.indexOf(tx._id) == -1){
								updatedAssets.push(tx._id);
								blockPromises.push(
									assetFunctions.assetUpdate(tx._id)
								);
							}
							break;
						case 1:
							// Transfer... Asset does not need to be updated. Only asset share holders.
							break;
						case 2:
							// Ask order, update asset-ask-orders and asset itself (top ask orders)
							// Need to fetch the order and find out which asset it is...
							// If an order has been filled also need to update trades

							// No break just uses below
						case 3:
							// Bid order, same thing
							if(updatedAssets.indexOf(tx.attachment.asset) == -1){
								updatedAssets.push(tx.attachment.asset);
								blockPromises.push(
									orderFunctions.updateOrders(tx.attachment.asset)
									.then(response => {
										return assetFunctions.assetUpdate(tx.attachment.asset);
									})
								);
							}
							break;
						case 4:
							// Ask cancellation, similiar thing
							// No break...does the same as for case 5: 
						case 5:
							// Bid cancellation


							// ----------------------------
							// Store already updated assets
							// ----------------------------


							blockPromises.push(
								// Find the order's asset from the DB, if it's in the db, otherwise don't even worry about it being cancelled
								orderFunctions.assetFromOrdersDB(tx.attachment.order)
								.then(order => {
									if(updatedAssets.indexOf(order.asset) == -1){
										updatedAssets.push(order.asset);

										// Update all the asset's orders
										return orderFunctions.updateOrders(order.asset)
											.then(response => {
											console.log(response);
											// update the asset
											return assetFunctions.assetUpdate(order.asset);
										});
									}
									else{
										return Promise.resolve("Asset already updated this block");
									}
								}, err => {
									console.log("Order not in DB");
									// Don't need to do anything, it's not even in the db
									return Promise.resolve("Order doesn't even exist in DB");
								})
							);
							break;
					}
				}
			}
			
			delete tx.senderPublicKey;
			delete tx.signature;
			delete tx.fullHash;
			delete tx.version;
			delete tx.ecBlockId;
			delete tx.signatureHash;
			// These two come in handy actually...
			//delete tx.sender;
			//delete tx.recipient;
			delete tx.block;
			delete tx.blockTimestamp;
			delete tx.deadline;
			delete tx.height;
			
			transactionsForBlock.push({
                _id: tx._id,
                sender: tx.sender,
                recipient: tx.recipient
            });
		})
		
		// Store / update account which won the block
		/*blockPromises.push(new Promise(() => {
			return accFunction(block.generator)
		}));*/
		
		if(accountsUpdatedThisBlock.indexOf(block.generator) == -1){
			accountsUpdatedThisBlock.push(block.generator);
            if(block.height!=0){
                blockPromises.push(
                    accFunction(block.generator, firstrun)
                );
            }
		}
		
		
		//console.log(blockPromises);
		
		// Wait and return all the tx promises, adding/updating accounts/assets
		return Promise.all(blockPromises)
			.then(response => {
			console.log(response);
			// Don't need trades in db
			/*if(!firstrun){
				return assetTrades();
			}*/
			return Promise.resolve("Skip trades");
		})
			.then(response => {
			console.log("Almost done");
			console.log(response);
			// Don't need to store transactions with block
			//block.transactions = transactionsForBlock;
			block._id = block.block;
			delete block.block;
			return blocksDB.put(block)
				.catch(err => {
				console.log(err);
				return Promise.resolve(err);
			});
		})
	})
}