/* jslint node: true */
'use strict';

module.exports = {
	chartData: chartData,
	volumes : volumes
};

function chartData(trades, asset){
	const assetDecimals = Math.pow(10, asset.decimals);
	
	const candlestickChart = [
		//["Day", "Open", "Close", "High", "Low"]
	];
	const volumeChart = [
		// ["Day", "Volume"]
	]

	const lastTrade = trades.length - 1;
	var day = trades[lastTrade].timestamp;
	var high, low, open, close, volume, timestamp;
	var oldHigh = 0,
		oldLow = 0,
		oldOpen = 0,
		oldClose = 0;
	
	const firstTradeTimestamp = trades[0].timestamp;
	while(day < firstTradeTimestamp){
		//console.log(day);
		day += 86400;
		high = 0;
		low = 99999999999999;
		open = 0;
		close = 0;
		volume = 0;
		trades.forEach((trade, index, allTrades) => {
			var price = parseInt(trade.priceNQT, 10) / 100000000 * assetDecimals;
			//trade.quantityQNT = parseInt(trade.quantityQNT, 10) / Math.pow(10, asset.decimals);
			//console.log(trade);
			// If trade is from current day
			if (trade.timestamp < day){
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
				allTrades.splice(index, 1);
			}
		})
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
		if(low == 99999999999999){
			low = oldClose;
		}
		// Store day
		timestamp = (day + 1407722400) * 1000; // Javascript timestmamp
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