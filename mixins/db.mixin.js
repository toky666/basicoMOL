"use strict";

const path = require("path");
const mkdir = require("mkdirp").sync;

const DbService	= require("moleculer-db");

const MONGO_ENABLED = true;
//const MongoAdapter = require("moleculer-db-adapter-mongo");
const MongoAdapter = require("./customAdapter");
module.exports = function(collection) {
		// Mongo adapter

		// return {
		// 	mixins: [DbService],
		// 	adapter: new MongoAdapter("mongodb://admin:D4c0rp#1964@localhost/cattleSystem?authSource=admin", {
		// 		//user: 'admin',
		// 		//pass: 'D4c0rp%231964',
		// 		//auth: {username: "admin", password:'D4c0rp#1964'},
		// 		keepAlive: true,
        //         useNewUrlParser: true
		// 		} ),
		// 	collection
		// };

		return {
			mixins: [DbService],
			adapter: new MongoAdapter(process.env.MONGO_URI || "mongodb://localhost/superCampeones" ),
			collection
		};
};
