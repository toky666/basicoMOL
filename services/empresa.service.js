"use strict";

const { MoleculerClientError } = require("moleculer").Errors;

const DbService = require("../mixins/db.mixin");
const CacheCleanerMixin = require("../mixins/cache.cleaner.mixin");

module.exports = {
	name: "empresa",
	mixins: [DbService("empresa"), CacheCleanerMixin(["cache.clean.empresa"])],

	/**
	 * Default settings
	 */
	settings: {
		/** REST Basepath */
		rest: "/",
		/** Secret for JWT */
		JWT_SECRET: process.env.JWT_SECRET || "jwt-conduit-secret",

		/** Public fields */
		fields: [
			"_id",
			"name",
			"email",
			"departament",
			"address",
			"telephone",
			"cellphone",
			"facebook",
			"image",
			"bank1",
			"bank2",
			"bank3",
			"deposit1",
			"deposit2",
			"deposit3",
		],

		/** Validator schema for entity */
		entityValidator: {},
	},

	/**
	 * Actions
	 */
	actions: {
		/**
		 * Register a new user
		 *
		 * @actions
		 * @param {Object} data - User entity
		 *
		 * @returns {Object} Created entity & token
		 */
		create: {
			rest: "POST /configuracion_empresa",
			cache: false,
			params: {
				data: { type: "object" },
			},
			async handler(ctx) {
				let entity = ctx.params.data;
				entity.name = entity.name.toUpperCase();
				entity.address = entity.address.toUpperCase();
				if(entity.facebook){
					entity.facebook = entity.facebook.toUpperCase();
				}
				if(entity.bank1){
					entity.bank1 = entity.bank1.toUpperCase();
				}
				if(entity.bank2){
					entity.bank2 = entity.bank2.toUpperCase();
				}
				if(entity.bank3){
					entity.bank3 = entity.bank3.toUpperCase();
				}

				entity.createdAt = new Date().toLocaleString("es", {
					timeZone: "America/La_Paz",
				});
				entity.updatedAt = new Date().toLocaleString("es", {
					timeZone: "America/La_Paz",
				});
				entity.enabled = true;
				return await this.adapter.insert(entity);
			},
		},
		/**
		 * Get User.
		 */
		get: {
			rest: "GET /configuracion_empresa/:id",
			cache: false,
			params: {
				id: { type: "string" },
			},
			async handler(ctx) {
				return await this.adapter.findOne({
					_id: this.adapter.stringToObjectID(ctx.params.id),
				});
			},
		},

		/**
		 * Delete User.
		 */
		remove: {
			rest: "DELETE /configuracion_empresa/:id",
			cache: false,
			params: {
				id: { type: "string" },
			},
			async handler(ctx) {
				return await this.adapter.updateById(ctx.params.id, {
					$set: { enabled: false },
				});
				//return this.adapter.removeById(ctx.params.id);
			},
		},

		update: {
			rest: "PUT /configuracion_empresa/:id",
			cache: false,
			params: {
				id: {
					type: "string",
				},
				data: {
					type: "object",
				},
			},
			async handler(ctx) {
				let entity = ctx.params.data;
				entity.name = entity.name.toUpperCase();
				entity.address = entity.address.toUpperCase();
				if(entity.facebook){
					entity.facebook = entity.facebook.toUpperCase();
				}
				if(entity.bank1){
					entity.bank1 = entity.bank1.toUpperCase();
				}
				if(entity.bank2){
					entity.bank2 = entity.bank2.toUpperCase();
				}
				if(entity.bank3){
					entity.bank3 = entity.bank3.toUpperCase();
				}

				entity.updatedAt = new Date().toLocaleString("es", {
					timeZone: "America/La_Paz",
				});
				return await this.adapter.updateById(ctx.params.id, { $set: entity });
			},
		},

		/**
		 * List Paginator User.
		 */
		datatable: {
			cache: false,
			rest: "GET /configuracion_empresa/:id",
			params: {
				id: { type: "string" },
				sort: { type: "string", optional: true },
				query: { type: "object", optional: true },
			},
			async handler(ctx) {
				let sort = ctx.params.sort || "-id";
				let data = await this.adapter.find({
					sort: [sort],
					limit: 1,
					query: { id: { $regex: ctx.params.id } },
				});
				// let count = await this.adapter.count({
				// 	query: { nombre: { $regex: ctx.params.nombre } },
				// });

				let json = await this.transformDocuments(
					ctx,
					{
						fields: [
							"_id",
							"name",
						],
					},
					data
				);
				return json;
				//return { data: data, count: count };
			},
		},

		search: {
			cache: false,
			rest: "POST /configuracion_empresa/search",
			params: {
				query: { type: "object" },
			},
			async handler(ctx) {
				const query = ctx.params.query ? this.gnrQuery(ctx.params.query) : {};
				return await this.adapter.find({ query: query });
			},
		},

		list: {
			rest: "GET /configuracion_empresa",
			cache: false,
		},
	},

	/**
	 * Methods
	 */
	methods: {
		gnrQuery(QUERY, OR) {
			var query = { enabled: true };
			if (QUERY && Object.keys(QUERY).length > 0) {
				if (OR) {
					query = { $and: [{ enabled: true }, { $or: [] }] }; //$or
				} else {
					query = { $and: [{ enabled: true }, { $and: [] }] }; //$or
				}

				var queries = Object.keys(QUERY);
				queries.forEach(function (e) {
					if (QUERY[e] && typeof QUERY[e] === "object") {
						let q = {};
						if (QUERY[e].type === "text") {
							q[e] = QUERY[e].value;
						}
						if (QUERY[e].type === "objectid") {
							q[e] = mongoose.Types.ObjectId(QUERY[e].value);
						}
						if (QUERY[e].type === "number") {
							if (!QUERY[e].operation || QUERY[e].operation === "equals")
								q[e] = QUERY[e].value;
							if (QUERY[e].operation === "gt") q[e] = { $gt: QUERY[e].value };
							if (QUERY[e].operation === "lt") q[e] = { $lt: QUERY[e].value };
							if (QUERY[e].operation === "gte") q[e] = { $gte: QUERY[e].value };
							if (QUERY[e].operation === "lte") q[e] = { $lte: QUERY[e].value };
						}
						if (QUERY[e].type === "date") {
							let d = new Date(QUERY[e].value + "T00:00:00"); //si le pones Z respeta la hora
							if (!QUERY[e].operation || QUERY[e].operation === "equals") {
								//console.log(QUERY[e].value)
								var d2 = new Date(QUERY[e].value + "T00:00:00");
								d2.setDate(d2.getDate() + 1); //añadir un dia
								q[e] = { $gte: d, $lt: d2 };
							}
							if (QUERY[e].operation === "gt") q[e] = { $gt: d };
							if (QUERY[e].operation === "lt") q[e] = { $lt: d };
							if (QUERY[e].operation === "gte") q[e] = { $gte: d };
							if (QUERY[e].operation === "lte") q[e] = { $lte: d };
						}
						if (QUERY[e].type === "range_date") {
							let d = new Date(QUERY[e].value[0] + "T00:00:00");
							var d2 = new Date(QUERY[e].value[1] + "T00:00:00");
							d2.setDate(d2.getDate() + 1); //añadir un dia
							if (!QUERY[e].operation || QUERY[e].operation === "equals")
								q[e] = { $gte: d, $lt: d2 };
						}
						if (QUERY[e].type === "boolean") {
							q[e] = QUERY[e].value;
						}
						if (QUERY[e].type === "object") {
							q[e] = QUERY[e].value;
						}
						if (OR) {
							query.$and[1]["$or"].push(q); //$or
						} else {
							query.$and[1]["$and"].push(q);
						}
					} else {
						let q = {};
						q[e] = new RegExp(QUERY[e], "i");
						if (OR) {
							query.$and[1]["$or"].push(q); //$or
						} else {
							query.$and[1]["$and"].push(q);
						}
					}
				});
			}
			return query;
		},

		gnrSort(SORT) {
			var sort = { _id: -1 };
			if (SORT) {
				var sorts = Object.keys(SORT);
				if (sorts.length > 0) sort = {};
				sorts.forEach(function (e) {
					if (SORT[e] === "asc") sort[e] = 1;
					else if (SORT[e] === "desc") sort[e] = -1;
				});
				return sort;
			} else {
				return sort;
			}
		},
	},
};
