Polymer({
    is: "home-view",

    properties: {
        id: {
            type: String,
            value: ""
        },
        currencies: {
            type: Array,
            value: []
        }
    },
    
    ready: function(){
        var httpRequest = new XMLHttpRequest();
        // Responose
        httpRequest.onreadystatechange = function(){
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
                if (httpRequest.status === 200){
                    
                    var result = JSON.parse(httpRequest.responseText);
                    console.log(Object.keys(result));
                    
                    var currencies = Object.keys(result).map(function(val){
                        return {
                            code: val,
                            data: result[val]
                        }
                    })
                    
                    console.log(currencies);
                }
            }
        }.bind(this);
        httpRequest.open("GET", "https://blockchain.info/ticker?cors=true");
        httpRequest.send();
    }
});