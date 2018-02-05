const accUpdate = require("./account.js");

accUpdate("8628161281313630310")
.then(response => {
	console.log(response);
})
.catch(err => {
	console.log(err);
})