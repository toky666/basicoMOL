"use strict";

const DbService = require("../mixins/db.mixin");
const CacheCleanerMixin = require("../mixins/cache.cleaner.mixin");

module.exports = {
	name: "roles",
	mixins: [DbService("roles"), CacheCleanerMixin(["cache.clean.roles"])],

	/**
	 * Default settings
	 */
	settings: {
		/** REST Basepath */
		rest: "/",
		/** Secret for JWT */
		JWT_SECRET: process.env.JWT_SECRET || "jwt-conduit-secret",

		/** Public fields */
		fields: ["_id", "name"],

		/** Validator schema for entity */
		entityValidator: {},
	},
	hooks: {
		// Se ejecuta cuando el servicio inicia
		async started() {
			console.log("Servicio roles iniciado, disparando consulta inicial...");
			const resp = await this.actions.datatable({
				limit: 5,
				offset: 0,
				query: {},
				sort: { _id: -1 },
			});
			console.log("Datos iniciales:", resp.data.length);
		},
	},
	/**
	 * Actions
	 */
	actions: {
		/**
		 * Register a new roles
		 *
		 * @actions
		 * @param {Object} data - User entity
		 *
		 * @returns {Object} Created entity & token
		 */
		create: {
			// auth: "required",
			rest: "POST /roles",
			cache: false,
			params: {
				data: { type: "object" },
			},
			async handler(ctx) {
				let entity = ctx.params.data;
				entity.name = entity.name.toUpperCase();
				entity.createdAt = new Date().toLocaleString("es", {
					timeZone: "America/La_Paz",
				});
				entity.updatedAt = new Date().toLocaleString("es", {
					timeZone: "America/La_Paz",
				});
				entity.enabled = true;
				//entity.usuario = ctx.meta.user || "desconocido";
				return await this.adapter.insert(entity);
			},
		},
		/**
		 * Get Roles.
		 */
		get: {
			// auth: "required",
			rest: "GET /roles/:id",
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
		 * Delete Roles.
		 */
		remove: {
			// auth: "required",
			rest: "DELETE /roles/:id",
			cache: false,
			params: {
				id: { type: "string" },
			},
			async handler(ctx) {
				/*return await this.adapter.updateById(ctx.params.id, {
									$set: { enabled: false },
								});*/
				return this.adapter.removeById(ctx.params.id);
			},
		},
		/**
		 * Update Roles.
		 */
		update: {
			// auth: "required",
			rest: "PUT /roles/:id",
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
				entity.updatedAt = new Date().toLocaleString("es", {
					timeZone: "America/La_Paz",
				});
				return await this.adapter.updateById(ctx.params.id, { $set: entity });
			},
		},
		list: {
			rest: "GET /roles",
			cache: false,
		},
		/**
		 * List Paginator Roles.
		 */
		datatable: {
			// auth: "required",
			rest: "POST /roles/datatable",
			cache: false,
			params: {
				limit: { type: "number", optional: true, convert: true },
				offset: { type: "number", optional: true, convert: true },
				query: { type: "object", optional: true },
				sort: { type: "object", optional: true },
			},
			async handler(ctx) {
				const limit = ctx.params.limit ? Number(ctx.params.limit) : 5;
				const query = ctx.params.query ? this.gnrQuery(ctx.params.query) : {};
				const sort = ctx.params.sort || "-_id";
				const offset = ctx.params.offset ? Number(ctx.params.offset) : 0;
				let params = {
					limit,
					offset: offset,
					sort: sort,
					query: query,
				};
				let count = await this.adapter.count({ query: query });
				let data = await this.adapter.find(params);
				return { data: data, count: count };
			},
		},

		dofilter: {
			rest: "POST /roles/dofilter",
			cache: false,
			params: {
				limit: { type: "number", optional: true, convert: true },
				offset: { type: "number", optional: true, convert: true },
				query: { type: "object", optional: true },
				sort: { type: "object", optional: true },
			},
			async handler(ctx) {
				const limit = ctx.params.limit ? Number(ctx.params.limit) : 5;
				const offset = ctx.params.offset ? Number(ctx.params.offset) : 0;
				const sort = ctx.params.sort || { _id: -1 }; // Construcción dinámica del query

				const query = ctx.params.query ? this.buildQuery(ctx.params.query) : {}; // Parámetros para el adaptador
				const params = { limit, offset, sort, query }; // Conteo total y datos filtrados
				const count = await this.adapter.count({ query });
				const data = await this.adapter.find(params);

				return { data, count: data.length === 0 ? 0 : count };
			},
		},
	},
	/**
	 * Methods
	 */
	methods: {
		buildQuery(rawQuery) {
			const query = {};
			for (const [key, value] of Object.entries(rawQuery)) {
				// Ignorar claves vacías o valores nulos
				if (!key || key.trim() === "" || value === undefined || value === null) {
					query[key] = { $regex: value, $options: "i" };
				}

				// Si el valor es un objeto, interpretamos operadores
				if (typeof value === "object" && !Array.isArray(value)) {
					const subQuery = {};
					for (const [op, val] of Object.entries(value)) {
						switch (op) {
							case "regex":
								subQuery["$regex"] = new RegExp(val, "i");
								break;
							case "gte":
								subQuery["$gte"] = val;
								break;
							case "lte":
								subQuery["$lte"] = val;
								break;
							case "in":
								subQuery["$in"] = Array.isArray(val) ? val : [val];
								break;
							default:
								subQuery[`$${op}`] = val;
						}
					}
					query[key] = subQuery;
				} else if (typeof value === "string") {
					// Valor simple tipo string → regex parcial
					query[key] = { $regex: value, $options: "i" };
				} else {
					// Valor simple no string → igualdad directa
					query[key] = value;
				}
			}
			return query;
		},

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
