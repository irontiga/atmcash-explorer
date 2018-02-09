class AssetView extends Polymer.Element{
    static get is() { return 'asset-view'; }

    constructor() {
        super();
    }

    static get properties() {
        return {
            id: {
                type: String
            },
            tradesDialogOpen: {
                type: Boolean,
                value: false
            },

            route:{
                type:Object,
                notify:true
            },
            orders: {
                type: Object,
                computed: "_getOrders(asset)"
            }

        }
    }
    
    _format(num){
        if(num == undefined){return}
        num = parseInt(num, 10);
        return num.toLocaleString();
    }
    
    _total(price, quantity){
        var num = price * quantity / 100000000;
        return num.toLocaleString();
    }

    _formatPrice(price){
        var newPrice = price / 100000000 * Math.pow(10, this.asset.decimals);
        return newPrice.toLocaleString();
    }
    
    _formatQuantity(quantity){
        var newQuantity = quantity / Math.pow(10, this.asset.decimals);
        return newQuantity.toLocaleString();
    }

    _assetUrl(assetID){
        return "/asset/" + assetID;
    }
    
    _sort(by, order){
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
    }
    _issueTime(timestamp){
        timestamp += 1407722400
        var a = new Date(timestamp*1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var time = date + ' ' + month + ' ' + ' ' + year;
        return time;
    }
    _formatQuantityPrice(a, b){
        return (a*b/100000000).toLocaleString();
    }
    
    _loadDetails(view){
        var dialog = this.$.detailView;
        switch(view){
                case "trades":
                break;
        }
    }
    ready(){
        super.ready();
        //console.log(this.tail);
    }
    
    _QNTFormat(quantity, decimals){
        return (quantity / Math.pow(10, decimals)).toLocaleString();
    }
    
    _tableClick(e){
        console.log(e);
        //this.set('route.path', e.srcElement.href);
    }

    _getOrders(asset){
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
    }

    _descriptionLink(description){
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
    
}

customElements.define('asset-view', AssetView);