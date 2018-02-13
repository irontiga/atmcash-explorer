Polymer({
	is: "search-view",
	
	properties: {
		search: {
			type: "string",
			value: "",
            observer: "_searchObserver"
		},
        loading: {
            type: Boolean,
            value: true
        }
	},
    
    _searchObserver: function(search){
        console.log(search);
        this.loading = true;
        this.searchResults = [];
        search = this.search;
        
        // If it's a number it's either an account ID, a transaction, an asset ID, or a block ID / height
        if(!isNaN(search)){
            
            // Check transaction
            burstapi({
                requestType: "getTransaction",
                transaction: search
            }).then(function(response){
                if(!("errorCode" in response)){
                    this.push("searchResults", {
                        url: "/transaction/" + search,
                        text: "Transaction " + search
                    })
                    //return Promise.resolve("Transaction found :D");
                    // Could be an asset too so...
                    return burstapi({
                        requestType: "getAsset",
                        asset: search
                    })
                }
                else{
                    return Promise.reject("Transaction not found :/");
                }
            }.bind(this)).then(function(response){
                if(!("errorCode" in response)){
                    // It's an asset...
                    this.push("searchResults", {
                        url: "/asset/" + search,
                        text: "Asset: " + search
                    });
                    return Promise.resolve("Asset found");
                }
                else{
                    return Promise.reject("Acount not found");
                }
            }.bind(this)).then(function(response){
                this.loading = false;
            }.bind(this), function(err){
                return burstapi({
                    requestType: "getAccount",
                    account: search
                })
            })
            .then(function(response){
                if(!("errorCode" in response)){
                    this.push("searchResults", {
                        url: "/account/" + search,
                        text: "Account: " + search
                    });
                    return Promise.resolve("Account found");
                }
                else{
                    return Promise.reject("Account not found");
                }
            }.bind(this)).then(function(response){
                this.loading = false;
            }.bind(this), function(err){
                return burstapi({
                    requestType: "getBlock",
                    block: search
                })
            }.bind(this)).then(function(response){
                if(!("errorCode" in response)){
                    this.push("searchResults", {
                        url: "/block/" + search,
                        text: "Block: " + search
                    });
                }
                else{
                    return Promise.reject("Block not found")
                }
            }.bind(this)).then(function(response){
                this.loading = false;
            }, function(err){
                this.loading = false;
            }.bind(this));
        }
        
        //this.loading = false;
    }
});