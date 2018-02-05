'use strict';

const blocksFunction = require("./blocks.js");
const compact = require("./compact.js");
const index = require("./index.js");

const firstLoopInt = 0;
let loopInt = 1000 * 10;
const compactInt = 1000000;

let firstrun = false;

process.argv.forEach((val, index, array) => {
	//console.log(index + ': ' + val);
	if(val == "firstrun"){
		loopInt = firstLoopInt;
		firstrun = true;
		console.log("Running in first run mode");
	}
});

index()
	.then(response => {
	console.log(response);
})
	.catch(err => {
	console.log(err);
})

function loop(){
	blocksFunction(firstrun)
		.then(response => {
		//console.log("|-|-| Response: ");
		//console.log(response);
		console.log("Success" +
					"\n-------");
		setTimeout(loop, loopInt);
	})
		.catch(err => {
		console.log("|||||||||| Error: |||||||||||");
		console.log(err);
		setTimeout(loop, loopInt);
	})
}

function compactLoop(){
	compact()
		.then(response => {
		console.log("|-|-| Compact response");
		console.log(response);
		setTimeout(compactLoop, compactInt);
	})
		.catch(err => {
		console.log("|-|-| Compact Error: ");
		console.log(err);
		setTimeout(compactLoop, compactInt);
	})
}


loop();
setTimeout(compactLoop, compactInt);