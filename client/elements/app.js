class ExplorerApp extends Polymer.Element{
    static get is() { return 'explorer-app'; }
    
    constructor() {
        super();
    }
    
    static get properties() {
        return {
            // declare properties for the element's public API
            searchText: {
                type: String,
                value: ""
            },
            dburl: {
                type: String,
                value: DB_URL
            },
            path:{
                observer: "_pathObserver"
            },
            lastRoute: {
                type: String,
                value: ""
            }
        }
    }
    
    static get observers() {
        return [
            '_routeChanged(route.path)'
        ]
    }
    
    connectedCallback() {
        super.connectedCallback();
        //console.log('my-element created!');
    }
    
    _search(e){
        //var searchInput = this.shadowRoot.querySelector("#searchInput").value;
        this.set('route.path', '/search/');
        this.set('routeData.id', this.searchValue);
    }
    _searchKeypress(e){
        if (e.keyCode === 13) {
            this._search(e);
        }
    }
    _pathObserver(){
        //console.log(this.path);
    }
       
    _routeChanged(newPath) {
        //console.log(newPath);
        if(newPath != this.lastRoute){
            ga('set', 'page', newPath);
            ga('send', 'pageview');
        }
        this.lastRoute = "";
        this.lastRoute = newPath; 
    }
    
    _toggleDrawer(e){
        this.$.appdrawer.toggle();
    }
    
    ready() {
        super.ready();
        //this.fire('iron-signal', {name: 'track-page', data: { path: "/about.html" } });
        this.dispatchEvent(new CustomEvent('iron-signal', {
            name: 'track-page',
            data: { 
                path: "/about.html" 
            }
        }));
    }
}

customElements.define('explorer-app', ExplorerApp);
/*
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
            value: window.location.protocol + "//" + window.location.hostname + ":5984/"
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
    }
    
});
*/