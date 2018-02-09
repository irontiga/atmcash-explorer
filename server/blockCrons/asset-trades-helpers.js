/* jslint node: true */
'use strict';

module.exports = {
	chartData: chartData,
	volumes : volumes
};

function chartData(trades, asset){
    // Reverse it so that trades[0] becomes the first ever trade, rather than the last ever
    trades = trades.reverse();
    
	const assetDecimals = Math.pow(10, asset.decimals);
	
	const candlestickChart = [
		//["Day", "Open", "Close", "High", "Low"]
	];
	const volumeChart = [
		// ["Day", "Volume"]
	]
    //console.log(trades);
    const dayLength = 4*60*60//86400;
    const startTimestamp = (trades[0].timestamp) - (trades[0].timestamp % dayLength) + dayLength;
    // Last trade is the first trade ever to happen, while first trade is last trade chronologically
    let day = startTimestamp;
    console.log("START: " + startTimestamp)
	let high, low, open, close, volume, timestamp;
	let oldHigh = 0,
		oldLow = 0,
		oldOpen = 0,
		oldClose = 0;
	
    const lastTrade = trades[trades.length - 1];
    //const endTimestamp = (lastTrade.timestamp) - (lastTrade.timestamp % dayLength) + dayLength;
    const timeNow = new Date().getTime();
    // Devide by 1000 because js timestamp is ms, whereas ATM/Burst timestamp is seconds, then adjust based on the blockchain's offset
    const endTimestamp = timeNow/1e3 - 1407722400;
    console.log(endTimestamp);
    const candleTrades = trades.slice();
    
	while(day <= endTimestamp){
		//console.log(day);
		high = 0;
		low = 1e16;
		open = 0;
		close = 0;
		volume = 0;
        
        //console.log(candleTrades);
        
        while(candleTrades.length > 0 && candleTrades[0].timestamp < day){
            const trade = candleTrades[0];
            const price = parseInt(trade.priceNQT, 10) / 1e8 * assetDecimals;
            
            if(price > high){
                high = price;
            }
            if(price < low){
                low = price;
            }
            if(open == 0){
                open = price;
            }
            close = price;
            volume += price * trade.quantityQNT / assetDecimals;
            
            candleTrades.splice(0, 1);
        }
        console.log(day);
        //console.log(candleTrades);
        
        /*for(let i=0;i<candleTrades.length;i++){
            const trade = candleTrades[i];
		//trades.forEach((trade, index, allTrades) => {
			var price = parseInt(trade.priceNQT, 10) / 100000000 * assetDecimals;
			//trade.quantityQNT = parseInt(trade.quantityQNT, 10) / Math.pow(10, asset.decimals);
			//console.log(trade);
			// If trade is from current day
            
			if (trade.timestamp < day){
                console.log(trade.timestamp + "<" + day + "(" + price + ")");
				if(price > high){
					high = price;
				}
				if(price < low){
					low = price;
				}
				if(open == 0){
					open = price;
				}
				close = price;
				volume += price * trade.quantityQNT / assetDecimals;
                console.log(i);
				candleTrades.splice(0, 1);
                //index += 1;
			}
            console.log(i);
		}*/
        //)
		// Set to previous day close if no trades
		if(open == 0){
			open = oldClose;
		}
		if(close == 0){
			close = oldClose;
		}
		if(high == 0){
			high = oldClose;
		}
		if(low == 1e16){
			low = oldClose;
		}
		// Store day
        // 1407722400 //864e5 + 
        timestamp = (day + 1407722400 - (86400 / 2) - 7200) * 1000; // Javascript timestmamp - 12 - 2 hours for conversion to UTC (Only because dayLength is 86400...aka 1 day)
        console.log(timestamp);
		candlestickChart.push([
			timestamp,
			open,
			high,
			low,
			close
		]);
		
		// Store the volume
		volumeChart.push([
			timestamp,
			Math.round(volume)
		])

		// Save values for next day;
		oldOpen = open;
		oldClose = close;
		oldHigh = high;
		oldLow = low;
        
        day += dayLength;
	}
	return {
		candlestickChart: candlestickChart,
		volumeChart: volumeChart
	};
}

function volumes(trades, asset){
	const assetDecimals = Math.pow(10, asset.decimals);
	var dailyVolume = 0;
	var weeklyVolume = 0;
	var monthlyVolume = 0;

	// 24 Volume
	const dailyTime = Math.floor(Date.now() / 1000) - 1407722400 - 86400;
	const weeklyTime = Math.floor(Date.now() / 1000) - 1407722400 - 604800;
	const monthlyTime = Math.floor(Date.now() / 1000) - 1407722400 - 2592000;

	trades.forEach(trade => {
		if(trade.timestamp > dailyTime){
			dailyVolume += trade.priceNQT / 100000000 * trade.quantityQNT;
		}
		if(trade.timestamp > weeklyTime){
			weeklyVolume += trade.priceNQT / 100000000 * trade.quantityQNT;
		}
		if(trade.timestamp > monthlyTime){
			monthlyVolume += trade.priceNQT / 100000000 * trade.quantityQNT;
		}
	})

	return {
		dailyVolume : Math.round(dailyVolume),
		weeklyVolume: Math.round(weeklyVolume),
		monthlyVolume : Math.round(monthlyVolume)
	}
}