var assets = new PouchDB('assets');

var accountView = Polymer({
	is: "account-view",

	properties: {
		id: {
			type: String,
			value: ""
		},
		route: {
			type: Object,
			notify: true
		},
		selectedTab:{
			type: Number,
			value: 0
		},
		aliasSource: {
			type: Object,
			computed: "_aliasSource(id)"
		}
	},
	
	_format: function(num){
		return num.toLocaleString();
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
		var time = hour + ':' + min + ' ' + date + ' ' + month + ' ' + ' ' + year;
		return time;
	},
	
	_accountAssetChanges: function(change){
		console.log("HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
		console.log(change);
	},
	
	_objKey(object, key){
		console.log(object[key].monthlyVolume);
		return object[key].monthlyVolume;
	},
	
	
	_aliasSource: function(id){
		return {
			get: function(sort, page, pageSize){
				return new Promise(function(resolve, reject){
					var httpRequest = new XMLHttpRequest();
					httpRequest.onreadystatechange = function(){
						if (httpRequest.readyState === XMLHttpRequest.DONE) {
							if (httpRequest.status === 200){
								var result = JSON.parse(httpRequest.responseText);
								var aliases = result.aliases;
								resolve(aliases);
							}
						}
					}.bind(this);
					httpRequest.open("GET", "http://127.0.0.1:8125/burst?requestType=getAliases&account="+this.id+"&firstIndex="+pageSize*(page-1)+"&lastIndex="+(page*pageSize-1));
					httpRequest.send();
				}.bind(this));
			}.bind(this),
			set: function(id, property, value){
				console.info("Bleh");
			}.bind(this)
		}
	},

	_aliasURI: function(uri){
		if(uri.indexOf("http") == 0){
			return "<a href='" + uri + "'>" + uri + "</a>";
		}
		if(uri.indexOf("acct:") == 0){
			return "<a href='/account/" + uri.slice(5, 31).toUpperCase() + "'>" + uri + "</a>"
		}
		return uri
	}
});
