module.exports = {
	"wallet": {
		"host": "127.0.0.1",
		"port": 8125,
		"protocol": "http",
		"localWalletDir": "C:/burstcoin-1.2.6/run.bat"
	},
	"db": {
		"url": "http://localhost:5984/",
		/*"auth": {
			"username": "",
			"password": ""
		}*/
    },
    "server": {
        port: 80,
        host: "127.0.0.1"
    }
};
//Copy to new file called config.js, and perhaps update the db username/password