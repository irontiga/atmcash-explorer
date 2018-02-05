Polymer({
	is: "asset-view",

	properties: {
		id: {
			type: String
		},
		tradesDialogOpen: {
			type: Boolean,
			value: false
		},
		tradeSource: {
			type: Object,
			computed: "_tradeSource(asset._id)"
		},
		
		route:{
			type:Object,
			notify:true
		},
		orders: {
			type: Object,
			computed: "_getOrders(asset)"
		}

	},

	_format: function(num){
		if(num == undefined){return}
		num = parseInt(num, 10);
		return num.toLocaleString();
	},
	
	_total(price, quantity){
		var num = price * quantity / 100000000;
		return num.toLocaleString();
	},
	
	_formatPrice(price){
		var newPrice = price / 100000000 * Math.pow(10, this.asset.decimals);
		return newPrice.toLocaleString();
	},
	
	_formatQuantity(quantity){
		var newQuantity = quantity / Math.pow(10, this.asset.decimals);
		return newQuantity.toLocaleString();
	},
	
	_tradeColor: function(type){
		if(type == "buy"){
			return "green";
		}
		return "red";
	},
	
	_assetUrl: function(assetID){
		return "/asset/" + assetID;
	},

	_sort: function(by, order){
		if(order == "desc"){
			return function(a, b){
				return b[by] - a[by];
			}
		}
		else{
			return function(a, b){
				return a[by] - b[by];
			}
		}
	},
	_time: function(timestamp){
		timestamp += 1407722400
		var a = new Date(timestamp*1000);
		var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		//var year = a.getFullYear();
		var month = months[a.getMonth()];
		var date = a.getDate();
		var hour = a.getHours();
		var min = a.getMinutes();
		//var sec = a.getSeconds();
		// Will display time in 10:30:23 format
		var time = date + ' ' + month + ' ' + ' ' + hour + ':' + min;
		return time;
	},
	_issueTime: function(timestamp){
		timestamp += 1407722400
		var a = new Date(timestamp*1000);
		var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		var year = a.getFullYear();
		var month = months[a.getMonth()];
		var date = a.getDate();
		var time = date + ' ' + month + ' ' + ' ' + year;
		return time;
	},
	_formatQuantityPrice: function(a, b){
		return (a*b/100000000).toLocaleString();
	},
	
	_loadDetails : function(view){
		var dialog = this.$.detailView;
		switch(view){
			case "trades":
				break;
		}
	},
	ready: function(){
		//console.log(this.tail);
	},
	
	_QNTFormat: function(quantity, decimals){
		return (quantity / Math.pow(10, decimals)).toLocaleString();
	},
	
	_tradeSource: function(id){
		return {
			get: function(sort, page, pageSize){
				// Promise
				return new Promise(function(resolve, reject){
					var httpRequest = new XMLHttpRequest();
					// Responose
					httpRequest.onreadystatechange = function(){
						if (httpRequest.readyState === XMLHttpRequest.DONE) {
							if (httpRequest.status === 200){

								var result = JSON.parse(httpRequest.responseText);
								var trades = result.trades;
								
								// Checks that the asset has loaded, and if not checks again in 200 milliseconds
								var checkAssetLoad = function(trades, resolve){
									if("name" in this.asset){
										trades = trades.map(function(trade){
											trade.price = trade.priceNQT / 100000000 * Math.pow(10, this.asset.decimals);
											trade.quantity = trade.quantityQNT / Math.pow(10, this.asset.decimals);
											trade.total = trade.priceNQT * trade.quantityQNT / 100000000;

											return trade;
										}.bind(this));
										
										return resolve(trades);
									}
									else{
										console.log("WWWAAAAAAAAIIIIIIIIIIIIIIIIIIITTTTTTTTTTTTTTT");
										setTimeout(function(){
											return checkAssetLoad(trades, resolve);
										}, 200)
									}
								}.bind(this);
								checkAssetLoad(trades, resolve);
							}
						}
					}.bind(this);
					httpRequest.open("GET", "http://127.0.0.1:8125/burst?requestType=getTrades&includeAssetInfo=false&asset="+this.id+"&firstIndex="+pageSize*(page-1)+"&lastIndex="+(page*pageSize-1));
					httpRequest.send();
				}.bind(this));
			}.bind(this),
			
			
			set: function(id, property, value){
				console.info("Bleh");
			}.bind(this),
			
			
			length: this.asset.numberOfTrades
		}
	},
	

	_tableClick: function(e){
		console.log(e);
		this.set('route.path', e.srcElement.href);
	},
	
	_getOrders: function(asset){
		if(!("name" in this.asset)){
			return {bids:[],asks:[],name:""};
		}
		var getOrders = function(orders){
			var sum = 0;
			var quantitySum = 0;
			return orders.map(function(order){
				var total = order.priceNQT * order.quantityQNT / 100000000;
				sum += total;
				var quantity = order.quantityQNT / Math.pow(10, this.asset.decimals);
				quantitySum += quantity;
				return {
					price: order.priceNQT / 100000000 * Math.pow(10, this.asset.decimals),
					quantity: quantity,
					total: total,
					sum: sum,
					quantitySum: quantitySum
				}
			}.bind(this))
		}.bind(this);
		
		return {
			name: this.asset.name,
			bids: getOrders(this.asset.bidOrders),
			asks: getOrders(this.asset.askOrders)
		}
	},
	
	_descriptionLink: function(description){
		if(typeof description == "undefined"){
			return;
		}
		// Get rid of any malicious stuff
		/*var div = document.createElement("div");
		div.innerHTML = description;
		description = div.innerText;*/
		
		// Match the links
		/*var match = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
		descriptionText.replace(match, "<a href='$1' target='_blank'>$1</a>");
		return descriptionText;*/
		
		return description.linkify();
	}
});