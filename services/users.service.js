"use strict";

const { MoleculerClientError } = require("moleculer").Errors;

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
		JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "jwt-refresh-secret",

		/** Public fields */
		fields: [
			"_id",
			"names",
			"last_names",
			"ci",
			"exp",
			"phone",
			"password",
			"sex",
			"email",
			"image",
			"birthday",
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
			auth: "required",
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
				if (entity.birthday) {
					entity.birthday = new Date(entity.birthday).toLocaleString("es", {
						timeZone: "America/La_Paz",
					});
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
			auth: "required",
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
			auth: "required",
			rest: "DELETE /users/:id",
			cache: false,
			params: {
				id: { type: "string" },
			},
			async handler(ctx) {
				return await this.adapter.updateById(ctx.params.id, {
					$set: { enabled: false },
				});
			},
		},
		/**
		 * Update User.
		 */
		update: {
			auth: "required",
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
		getEmail: {
			auth: "required",
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
		getUsers: {
			auth: "required",
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
							"exp",
							"phone",
							"password",
							"sex",
							"email",
							"image",
							"birthday",
							"idrol",
							"address",
						],
					},
					data
				);
				return json;
				//return { data: data, count: count };
			},
		},
		updateContrasena: {
			auth: "required",
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
		dofilter: {
			auth: "required",
			rest: "POST /users/dofilter",
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
		/**
		 * List Paginator User.
		 */
		datatable: {
			auth: "required",
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

		/**
		 * Login with username & password
		 *
		 * @actions
		 * @param {Object} user - User credentials
		 *
		 * @returns {Object} Logged in user with token
		 */
		login: {
			//rest: "POST /users/login",
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
				console.log("***********************");
				console.log(ctx.params.user);
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
			cache: false,
			//Para rendimiento: puedes usar ttl en Moleculer
			/*cache: {
				keys: ["token"],
				ttl: 60 * 60, // 1 hora solo cache, no controla la vida del token
			},*/
			params: {
				token: "string",
			},
			async handler(ctx) {
				try {
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
					if (decoded._id) return this.getById(decoded._id);
				} catch (err) {
					if (err.name === "TokenExpiredError") {
						// Token vencido → respuesta clara
						throw new UnAuthorizedError("Token expirado", 401, "TOKEN_EXPIRED", {
							error: "Token expirado",
							expiredAt: err.expiredAt, // fecha exacta en que venció
							code: "TOKEN_EXPIRED"
						});
					}
					throw new UnAuthorizedError("Token inválido", 401, "TOKEN_INVALID", {
						error: "Token inválido",
						code: "TOKEN_INVALID"
					});
				}
			},
		},

		refreshToken: {
			rest: "POST /users/refreshToken",
			cache: false,
			params: {
				refreshToken: "string"
			},
			async handler(ctx) {
				try {
					const decodedRefresh = jwt.verify(
						ctx.params.refreshToken,
						this.settings.JWT_REFRESH_SECRET
					);
					const user = await this.getById(decodedRefresh._id);
					const newAccessToken = jwt.sign(
						{
							_id: user._id,
							idrol: user.idrol,
							namerol: user.namerol,
						},
						this.settings.JWT_SECRET,
						{ expiresIn: "15m" },

					);

					/*const newAccessRefreshToken = jwt.sign(
						{
							_id: user._id,
							idrol: user.idrol,
							namerol: user.namerol,
						},
						this.settings.JWT_REFRESH_SECRET,
						{ expiresIn: "10m" },

					);*/
					return { user, token: newAccessToken };
				} catch (err) {
					throw new UnAuthorizedError("Refresh token inválido", 401, "REFRESH_INVALID", {
						error: "Refresh token inválido",
						code: "REFRESH_INVALID"
					});
				}
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
	saveDraft: {
		rest: "POST /users/saveDraft",
		cache: false,
		params: {
			formData: "object" // los datos parciales del formulario
		},
		async handler(ctx) {
			try {
				const userId = ctx.meta.user._id; // viene del JWT ya validado
				const { formData } = ctx.params;

				// Guardar o actualizar draft en DB
				const draft = await this.adapter.findOne({ userId });
				if (draft) {
					await this.adapter.updateById(draft._id, {
						$set: { formData, updatedAt: new Date() }
					});
				} else {
					await this.adapter.insert({
						userId,
						formData,
						updatedAt: new Date()
					});
				}

				return { message: "Draft guardado correctamente" };
			} catch (err) {
				throw new Error("Error al guardar draft: " + err.message);
			}
		}
	},

	getDraft: {
		rest: "GET /users/getDraft",
		cache: false,
		async handler(ctx) {
			try {
				const userId = ctx.meta.user._id;
				const draft = await this.adapter.findOne({ userId });

				if (!draft) {
					return { message: "No hay draft guardado" };
				}

				return { formData: draft.formData, updatedAt: draft.updatedAt };
			} catch (err) {
				throw new Error("Error al recuperar draft: " + err.message);
			}
		}
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
			exp.setMinutes(today.getMinutes() + 2);
			//exp.setHours(today.getHours() + 10); //el tokens dura 10 hrs
			const now = new Date();
			const expSeconds = Math.floor(exp.getTime() / 1000);
			const nowSeconds = Math.floor(now.getTime() / 1000); // fecha actual en segundos
			console.log("Tiempo actual (segundos):", nowSeconds);
			console.log("Expira en (segundos):", expSeconds);
			console.log("Diferencia:", expSeconds - nowSeconds, "segundos");
			return jwt.sign(
				{
					_id: user._id,
					idrol: user.idrol,
					namerol: user.namerol,
					image: user.image,
					last_name: user.last_name,
					names: user.names,
					//exp: "2m"
					exp: expSeconds,
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
					},
					this.settings.JWT_SECRET,
					{ expiresIn: "15m" } // aquí defines la expiración real
				),
				refreshToken: jwt.sign(
					{
						_id: user._id,
						idrol: user.idrol,
						namerol: user.namerol,
						image: user.image,
						last_name: user.last_name,
						names: user.names,
					}, // puedes guardar solo lo mínimo
					this.settings.JWT_REFRESH_SECRET, // usa otra clave distinta
					{ expiresIn: "8h" } // refresh dura más tiempo
				),
			};
			console.log("**************************");
			console.log(data);
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
