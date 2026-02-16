"use strict";

const { MoleculerClientError } = require("moleculer").Errors;

const crypto = require("crypto");

const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");

const DbService = require("../mixins/db.mixin");
const CacheCleanerMixin = require("../mixins/cache.cleaner.mixin");

module.exports = {
	name: "users",
	mixins: [DbService("users"), CacheCleanerMixin(["cache.clean.users"])],

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
			"names",
			"last_names",
			"ci",
			"phone",
			"password",
			"email",
			"image",
			"idrol",
			"address",
		],

		/** Validator schema for entity */
		entityValidator: {
			// username: { type: "string", min: 2 },
			// password: { type: "string", min: 6 },
			// email: { type: "email" },
			// bio: { type: "string", optional: true },
			// image: { type: "string", optional: true },
		},
	},

	/**
	 * Actions
	 */
	actions: {
		/**
		 * Register a new user
		 *
		 * @actions
		 * @param {Object} user - User entity
		 *
		 * @returns {Object} Created entity & token
		 */
		create: {
			rest: "POST /users",
			cache: false,
			params: {
				user: { type: "object" },
			},
			async handler(ctx) {
				let entity = ctx.params.user;

				await this.validateEntity(entity);
				if (entity.names) {
					entity.names = entity.names.toUpperCase();
				}
				if (entity.last_names) {
					entity.last_names = entity.last_names.toUpperCase();
				}
				if (entity.email) {
					const found = await this.adapter.findOne({ email: entity.email });
					if (found)
						throw new MoleculerClientError("Email is exist!", 422, "", [
							{ field: "email", message: "is exist" },
						]);
				}

				try {
					var salt = bcrypt.genSaltSync(10);
					var hash = bcrypt.hashSync(entity.password, salt);
					entity.password = hash;
				} catch (e) {
					return { error: err };
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
			rest: "GET /users/:id",
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
			rest: "DELETE /users/:id",
			cache: false,
		},
		// remove: {
		// 	rest: "DELETE /users/:id",
		// 	cache: false,
		// 	params: {
		// 		id: { type: "string" },
		// 	},
		// 	async handler(ctx) {
		// 		return await this.adapter.updateById(ctx.params.id, {
		// 			$set: { enabled: false },
		// 		});
		// 	},
		// },
		/**
		 * Update User.
		 */
		update: {
			rest: "PUT /users/:id",
			cache: false,
			params: {
				id: {
					type: "string",
				},
				user: {
					type: "object",
				},
			},
			async handler(ctx) {
				let entity = ctx.params.user;
				if (entity.names) {
					entity.names = entity.names.toUpperCase();
				}
				if (entity.last_names) {
					entity.last_names = entity.last_names.toUpperCase();
				}
				entity.updatedAt = new Date().toLocaleString("es", {
					timeZone: "America/La_Paz",
				});
				return await this.adapter.updateById(ctx.params.id, { $set: entity });
			},
		},
		getUsers: {
			// auth: "required",
			cache: false,
			rest: "GET /get_nombre/:names",
			params: {
				names: { type: "string" },
				sort: { type: "string", optional: true },
				query: { type: "object", optional: true },
			},
			async handler(ctx) {
				let sort = ctx.params.sort || "-id";
				let data = await this.adapter.find({
					sort: [sort],
					limit: 1,
					query: { names: { $regex: ctx.params.names } },
				});
				// let count = await this.adapter.count({
				// 	query: { nombre: { $regex: ctx.params.nombre } },
				// });

				let json = await this.transformDocuments(
					ctx,
					{
						fields: [
							"_id",
							"names",
							"last_names",
							"ci",
							"phone",
							"password",
							"email",
							"image",
							"idrol",
						],
					},
					data
				);
				return json;
				//return { data: data, count: count };
			},
		},
		getLastNames: {
			// auth: "required",
			cache: false,
			rest: "GET /get_apellido/:last_names",
			params: {
				last_names: { type: "string" },
				sort: { type: "string", optional: true },
				query: { type: "object", optional: true },
			},
			async handler(ctx) {
				let sort = ctx.params.sort || "-id";
				let data = await this.adapter.find({
					sort: [sort],
					limit: 1,
					query: { last_names: { $regex: ctx.params.last_names } },
				});
				// let count = await this.adapter.count({
				// 	query: { nombre: { $regex: ctx.params.nombre } },
				// });

				let json = await this.transformDocuments(
					ctx,
					{
						fields: [
							"_id",
							"names",
							"last_names",
							"ci",
							"phone",
							"password",
							"email",
							"image",
							"idrol",
						],
					},
					data
				);
				return json;
				//return { data: data, count: count };
			},
		},
		getCI: {
			// auth: "required",
			cache: false,
			rest: "GET /get_ci/:ci",
			params: {
				ci: { type: "string" },
				sort: { type: "string", optional: true },
				query: { type: "object", optional: true },
			},
			async handler(ctx) {
				let sort = ctx.params.sort || "-id";
				let data = await this.adapter.find({
					sort: [sort],
					limit: 1,
					query: { ci: { $regex: ctx.params.ci } },
				});
				// let count = await this.adapter.count({
				// 	query: { nombre: { $regex: ctx.params.nombre } },
				// });

				let json = await this.transformDocuments(
					ctx,
					{
						fields: [
							"_id",
							"names",
							"last_names",
							"ci",
							"phone",
							"password",
							"email",
							"image",
							"idrol",
						],
					},
					data
				);
				return json;
				//return { data: data, count: count };
			},
		},
		getTelephone: {
			// auth: "required",
			cache: false,
			rest: "GET /get_telefono/:phone",
			params: {
				phone: { type: "string" },
				sort: { type: "string", optional: true },
				query: { type: "object", optional: true },
			},
			async handler(ctx) {
				let sort = ctx.params.sort || "-id";
				let data = await this.adapter.find({
					sort: [sort],
					limit: 1,
					query: { phone: { $regex: ctx.params.phone } },
				});
				// let count = await this.adapter.count({
				// 	query: { nombre: { $regex: ctx.params.nombre } },
				// });

				let json = await this.transformDocuments(
					ctx,
					{
						fields: [
							"_id",
							"names",
							"last_names",
							"ci",
							"phone",
							"password",
							"email",
							"image",
							"idrol",
						],
					},
					data
				);
				return json;
				//return { data: data, count: count };
			},
		},
		getRoles: {
			// auth: "required",
			cache: false,
			rest: "GET /get_roles/:roles",
			params: {
				roles: { type: "string" },
				sort: { type: "string", optional: true },
				query: { type: "object", optional: true },
			},
			async handler(ctx) {
				let sort = ctx.params.sort || "-id";
				let data = await this.adapter.find({
					sort: [sort],
					limit: 1,
					query: { roles: { $regex: ctx.params.roles } },
				});
				// let count = await this.adapter.count({
				// 	query: { nombre: { $regex: ctx.params.nombre } },
				// });

				let json = await this.transformDocuments(
					ctx,
					{
						fields: [
							"_id",
							"names",
							"last_names",
							"ci",
							"phone",
							"password",
							"email",
							"image",
							"idrol",
							"namerol",

						],
					},
					data
				);
				return json;
				//return { data: data, count: count };
			},
		},
		getEmail: {
			cache: false,
			rest: "GET /get_email/:email",
			params: {
				email: { type: "string" },
				sort: { type: "string", optional: true },
				query: { type: "object", optional: true },
			},
			async handler(ctx) {
				let sort = ctx.params.sort || "-names";
				let data = await this.adapter.find({
					sort: [sort],
					limit: 1,
					query: { email: { $regex: ctx.params.email } },
				});

				let json = await this.transformDocuments(
					ctx,
					{
						fields: ["email"],
					},
					data
				);
				return json;
			},
		},
		updateContrasena: {
			rest: "PUT /contrasena/:id",
			cache: false,
			params: {
				id: {
					type: "string",
				},
				user: {
					type: "object",
				},
			},
			async handler(ctx) {
				let entity = ctx.params.user;
				var salt = bcrypt.genSaltSync(10);
				var hash = bcrypt.hashSync(entity.password, salt);
				entity.password = hash;
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
			rest: "POST /users/datatable",
			params: {
				limit: { type: "number", optional: true, convert: true },
				offset: { type: "number", optional: true, convert: true },
				query: { type: "object", optional: true },
				sort: { type: "object", optional: true },
			},
			async handler(ctx) {
				console.log(ctx);
				const limit = ctx.params.limit ? Number(ctx.params.limit) : 10;
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
		search: {
			cache: false,
			rest: "POST /users/search",
			params: {
				query: { type: "object" },
			},
			async handler(ctx) {
				const query = ctx.params.query ? this.gnrQuery(ctx.params.query) : {};
				return await this.adapter.find({ query: query });
			},
		},

		/**
		 * Login with username & password
		 *
		 * @actions
		 * @param {Object} user - User credentials
		 *
		 * @returns {Object} Logged in user with token
		 */
		login: {
			// rest: "POST /users/login",
			params: {
				user: {
					type: "object",
					props: {
						email: { type: "email" },
						password: { type: "string", min: 1 },
					},
				},
			},
			async handler(ctx) {
				const { email, password } = ctx.params.user;

				const user = await this.adapter.findOne({ email });

				if (!user)
					throw new MoleculerClientError(
						"Email or password is invalid!",
						422,
						"",
						[{ field: "message", message: "Usuario no registrado" }]
					);

				//const res = true;
				var hash = bcrypt.hashSync(user.password);
				console.log(user.password);
				const res = await bcrypt.compareSync(password, user.password);

				if (!res)
					throw new MoleculerClientError("Wrong password!", 422, "", [
						{
							field: "message",
							message: "La contraseÃ±a no es correcta. Intentalo de nuevo",
						},
					]);
				// const doc = await this.transformDocuments(ctx, {}, user);

				//  const doc = await this.transformDocuments(ctx, {}, user);
				//  return await this.transformEntity(doc, true, ctx.meta.token);
				return await this.transformEntityToken(user);
			},
		},

		/**
		 * Get user by JWT token (for API GW authentication)
		 *
		 * @actions
		 * @param {String} token - JWT token
		 *
		 * @returns {Object} Resolved user
		 */
		resolveToken: {
			cache: {
				keys: ["token"],
				ttl: 60 * 60, // 1 hour
			},
			params: {
				token: "string",
			},
			async handler(ctx) {
				const decoded = await new this.Promise((resolve, reject) => {
					jwt.verify(
						ctx.params.token,
						this.settings.JWT_SECRET,
						(err, decoded) => {
							if (err) return reject(err);

							resolve(decoded);
						}
					);
				});

				if (decoded.id) return this.getById(decoded.id);
			},
		},

		/**
		 * Get current user entity.
		 * Auth is required!
		 *
		 * @actions
		 *
		 * @returns {Object} User entity
		 */
		me: {
			auth: "required",
			rest: "GET /user",
			cache: {
				keys: ["#userID"],
			},
			async handler(ctx) {
				const user = await this.getById(ctx.meta.user._id);
				if (!user) throw new MoleculerClientError("User not found!", 400);

				const doc = await this.transformDocuments(ctx, {}, user);
				return await this.transformEntity(doc, true, ctx.meta.token);
			},
		},

		list: {
			rest: "GET /users",
			cache: false,
		},
	},

	/**
	 * Methods
	 */
	methods: {
		/**
		 * Generate a JWT token from user entity
		 *
		 * @param {Object} user
		 */
		generateJWT(user) {
			const today = new Date();
			const exp = new Date(today);
			// exp.setDate(today.getDate() + 60);
			// exp.setMinutes(today.getMinutes() + 5);
			exp.setHours(today.getHours() + 10); //el tokens dura 10 hrs
			return jwt.sign(
				{
					_id: user._id,
					idrol: user.idrol,
					namerol: user.namerol,
					image: user.image,
					last_name: user.last_name,
					names: user.names,
					exp: Math.floor(exp.getTime() / 1000),
				},
				this.settings.JWT_SECRET
			);
		},

		/**
		 * Transform returned user entity. Generate JWT token if neccessary.
		 *
		 * @param {Object} user
		 * @param {Boolean} withToken
		 */
		transformEntity(user, withToken, token) {
			if (user) {
				//user.image = user.image || "https://www.gravatar.com/avatar/" + crypto.createHash("md5").update(user.email).digest("hex") + "?d=robohash";
				user.image = user.image || "";
				if (withToken) user.token = token || this.generateJWT(user);
			}

			return { user };
		},
		/**
		 * Transform a result entity to follow the RealWorld API spec
		 *
		 * @param {Context} ctx
		 * @param {Object} entity
		 * @param {Object} user - Logged in user
		 */
		transformEntity(ctx, entity) {
			if (!entity) return this.Promise.resolve();

			return this.Promise.resolve(entity);
		},
		/**
		 * Transform returned user entity. Generate JWT token if neccessary.
		 *
		 * @param {Object} user
		 */
		transformEntityToken(user) {
			//user.image = user.image || "https://www.gravatar.com/avatar/" + crypto.createHash("md5").update(user.email).digest("hex") + "?d=robohash";
			const today = new Date();
			const exp = new Date(today);
			// exp.setDate(today.getDate() + 2);
			// exp.setMinutes(today.getMinutes() + 5);
			exp.setHours(today.getHours() + 10); //el tokens dura 10 hrs
			let data = {
				_id: user._id,
				idrol: user.idrol,
				namerol: user.namerol,
				image: user.image,
				last_name: user.last_name,
				names: user.names,
				token: jwt.sign(
					{
						_id: user._id,
						idrol: user.idrol,
						namerol: user.namerol,
						image: user.image,
						last_name: user.last_name,
						names: user.names,
						exp: Math.floor(exp.getTime() / 1000),
					},
					this.settings.JWT_SECRET
				),
			};
			return { data };
		},

		/**
		 * Transform returned user entity as profile.
		 *
		 * @param {Context} ctx
		 * @param {Object} user
		 * @param {Object?} loggedInUser
		 */
		async transformProfile(ctx, user, loggedInUser) {
			//user.image = user.image || "https://www.gravatar.com/avatar/" + crypto.createHash("md5").update(user.email).digest("hex") + "?d=robohash";
			user.image =
				user.image ||
				"https://static.productionready.io/images/smiley-cyrus.jpg";

			if (loggedInUser) {
				const res = await ctx.call("follows.has", {
					user: loggedInUser._id.toString(),
					follow: user._id.toString(),
				});
				user.following = res;
			} else {
				user.following = false;
			}

			return { profile: user };
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
