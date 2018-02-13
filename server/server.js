"use strict";

const Hapi = require("hapi");
const Inert = require("inert");

let devMode = false;

process.argv.forEach((val, index, array) => {
	console.log(index + ": " + val);
	if(val == "dev"){
		devMode = true;
		console.log("Running in dev mode");
	}
});


const server = new Hapi.Server();

server.connection({ port: 80 });

server.register(Inert, () => {});

server.route([
	{
		method: "GET",
		path: "/{path*}",
		handler: function(request, reply){
			console.log(request.params);
			if(devMode){
				return reply.file("./client/index.html");
			}
			return reply.file("./client/build.html");
		}
	},
	{
		method: "GET",
		path: "/client/{param*}",
		handler: {
			directory: {
				path: "./client",
				redirectToSlash: true,
				index: true
			}
		}
	}
]);

server.start((err) => {
	if (err) {
		throw err;
	}
	console.log(`Server running at: ${server.info.uri}`);
});