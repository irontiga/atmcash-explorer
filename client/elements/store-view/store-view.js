Polymer({
	is: "store-view",

	properties: {
		id: {
			type: String,
			value: ""
		}
	},

	_formatNQT: function(num){
		num =  parseFloat((num / 100000000).toFixed(0));
		return num.toLocaleString();
	},
	_NQTDecimals: function(num){
		return "." + (
			parseFloat((num / 100000000).toFixed(0)) - parseFloat((num / 100000000).toFixed(8))
		).toString().slice(-8);
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
		var time = year + ' ' + date + ' ' + month + ' ' + ' ' + hour + ':' + min;
		return time;
	}
});