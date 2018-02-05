var app = Polymer({
	is: "explorer-app",

	// add properties and methods on the element's prototype

	properties: {
		// declare properties for the element's public API
		searchText: {
			type: String,
			value: ""
		},
		dburl: {
			type: String,
			value: "http://127.0.0.1:5984/"
		},
		path:{
			observer: "_pathObserver"
		},
        lastRoute: {
            type: String,
            value: ""
        }
    },
    observers: [
        '_routeChanged(route.path)'
    ],

	_search: function(e){
		var searchInput = this.$.searchInput.value;
		this.set('route.path', '/search/');
		this.set('searchData.search', searchInput);
	},
	_searchKeypress: function(e){
		if (e.keyCode === 13) {
			this._search(e);
		}
	},
	_pathObserver: function(){
		console.log(this.path);
	},
    ready: function(){
        this.fire('iron-signal', {name: 'track-page', data: { path: "/about.html" } });
    },
    _routeChanged: function(newPath) {
        //console.log(newPath);
        if(newPath != this.lastRoute){
            ga('set', 'page', newPath);
            ga('send', 'pageview');
        }
        this.lastRoute = "";
        this.lastRoute = newPath; 
    },
    
});