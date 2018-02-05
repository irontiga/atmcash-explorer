Polymer({
	is: "transaction-view",

	properties: {
		transaction: {
			type: Object,
			value: {}
		},
		id: {
			type: String,
			value: ""
		}
	},
	
	_formatNQT: function(num){
		num =  parseFloat((num / 100000000).toFixed(0));
		return num.toLocaleString();
	},
	
	_time: function(timestamp){
		timestamp += 1407722400
		var a = new Date(timestamp*1000);
		var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		var year = a.getFullYear();
		var month = months[a.getMonth()];
		var date = a.getDate();
		var hour = a.getHours();
		var min = a.getMinutes();
		//var sec = a.getSeconds();
		// Will display time in 10:30:23 format
		var time = date + ' ' + month + ' ' + ' ' + hour + ':' + min + " (" + year + ")";
		return time;
	},
	
	_txType: function(type, subtype){
		return txTypes[type][subtype];
	},
	
	_toArray: function(obj) {
		return Object.keys(obj).map(function(key) {
			return {
				name: key,
				value: obj[key]
			};
		});
	},
	
	_isObj: function(obj){
		if(typeof(obj) === "object" && obj !== null){
			return true;
		}
		return false;
	}

});