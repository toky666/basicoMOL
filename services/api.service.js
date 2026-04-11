"use strict";
const _ = require("lodash");
const ApiGateway = require("moleculer-web");
const { UnAuthorizedError } = ApiGateway.Errors;
const jwt = require('jsonwebtoken');
const { MoleculerClientError } = require('moleculer').Errors;
module.exports = {
	name: "api",
	mixins: [ApiGateway],
	settings: {
		port: process.env.PORT || 3081,
		cors: {
			origin: "http://localhost:4200", 	//mi FRONTEND esta en el puerto http://localhost:4200, pero si usas postman usa *
			credentials: true,					// 👈 Permite enviar cookies en las solicitudes CORS
		},
		routes: [
			{
				//path: "/",  // ← Esta ruta debe contener el login
				authorization: false,
				aliases: {
					"POST /users/login": "users.login",
					"GET /me": "users.me",
					"POST /users/refreshToken": "users.refreshToken"
				},
				onBeforeCall(ctx, route, req, res) {
					// Pasar headers y cookies al contexto
					ctx.meta.headers = req.headers;
					ctx.meta.cookies = req.headers.cookie || '';
				},
				onAfterCall(ctx, route, req, res, data) {
					// Pasar las cookies del contexto a la respuesta
					if (ctx.meta.headers && ctx.meta.headers['Set-Cookie']) {
						res.setHeader('Set-Cookie', ctx.meta.headers['Set-Cookie']);
					}
					return data;
				},
				mappingPolicy: "restrict",
				bodyParsers: {
					json: {
						strict: false,
					},
					urlencoded: {
						extended: false,
					},
				},
			},
			{
				path: "/api",
				authorization: true, //aqui es donde se activa la autorizacion para los demas apis de cada servicio
				autoAliases: true,
				cors: true,
				bodyParsers: {
					json: {
						strict: false,
					},
					urlencoded: {
						extended: false,
					},
				},

				onError(req, res, err) {
					// Return with the error as JSON object
					res.setHeader("Content-type", "application/json; charset=utf-8");
					res.writeHead(err.code || 500);

					if (err.code == 422) {
						let o = {};
						err.data.forEach((e) => {
							let field = e.field.split(".").pop();
							o[field] = e.message;
						});

						res.end(JSON.stringify({ errors: o }, null, 2));
					} else {
						const errObj = _.pick(err, ["name", "message", "code", "type", "data"]);
						res.end(JSON.stringify(errObj, null, 2));
					}
					this.logResponse(req, res, err ? err.ctx : null);
				},

			},
			{
				path: "/upload",
				authorization: false,
				bodyParsers: {
					//json: false,
					urlencoded: false,
				},
				aliases: {
					"GET /:folder/:file": "file.get",
					"GET /del/:folder/:file": "file.del",
					"POST /save/business": {
						type: "multipart",
						busboyConfig: {
							files: 3,
						},
						action: "file.saveBusiness",
					},
					"POST /save/users": {
						type: "multipart",
						busboyConfig: {
							files: 3,
						},
						action: "file.saveUsers",
					},
					"POST /save/animals": {
						type: "multipart",
						busboyConfig: {
							files: 3,
						},
						action: "file.saveAnimals",
					},
					"POST /edit/users": {
						type: "multipart",
						// Action level busboy config
						busboyConfig: {
							limits: {
								files: 3,
							},
						},
						action: "file.uploadFile",
					},
				},

				// https://github.com/mscdex/busboy#busboy-methods
				busboyConfig: {
					limits: {
						files: 5,
					},
				},

				callOptions: {
					meta: {
						a: 5,
					},
				},

				mappingPolicy: "restrict",
			},
		],

		assets: {
			folder: "./public",
		},

		// logRequestParams: "info",
		// logResponseData: "info",


	},

	methods: {
		/**
		 * Authorize the request
		 *
		 * @param {Context} ctx
		 * @param {Object} route
		 * @param {IncomingRequest} req
		 * @returns {Promise}
		 */

		async authorize(ctx, route, req, res) {
			// ✅ Excluye /me completamente
			if (req.url.includes('/api/me')) {
				console.log("Saltando autorización para /me");
				return; // Sale sin hacer nada
			}
			console.log("action name", ctx.action.name);
			console.log("URL:", req.url);
			const cookies = req.headers.cookie || '';
			console.log("Cookies en authorize:", cookies);

			const accessToken = cookies
				.split(';')
				.find(c => c.trim().startsWith('accessToken='))
				?.split('=')[1];

			console.log("Token extraído:", accessToken);

			if (!accessToken) {
				throw new MoleculerClientError("Unauthorized: No token", 401);
			}

			try {
				const decoded = jwt.verify(accessToken, process.env.JWT_SECRET || "jwt-conduit-secret");
				ctx.meta.token = decoded;
			} catch (err) {
				console.error("Error verificando token:", err.message);
				throw new MoleculerClientError("Unauthorized: Token inválido", 401);
			}
		}

		/*async authorize(ctx, route, req) {
			let tokenValue = null;

			// Opción 1: Desde cookies
			const cookies = req.headers.cookie;
			console.log("Cookies recibidas:", cookies); // ← DEBUG

			if (cookies) {
				const accessToken = cookies.split(';').find(c => c.trim().startsWith("accessToken="));
				if (accessToken) {
					tokenValue = accessToken.split("=")[1];
				}
			}

			// Opción 2: Desde Authorization header
			if (!tokenValue && req.headers.authorization) {
				const auth = req.headers.authorization;
				console.log("Auth header:", auth); // ← DEBUG
				tokenValue = auth.replace("Bearer ", "").replace("Token ", "");
			}

			console.log("Token a verificar:", tokenValue); // ← DEBUG
			console.log("JWT_SECRET:", this.settings.JWT_SECRET); // ← DEBUG

			if (tokenValue) {
				try {
					const decoded = jwt.verify(tokenValue, this.settings.JWT_SECRET);
					ctx.meta.token = decoded;
					return ctx.meta.token;
				} catch (err) {
					console.log("JWT Error:", err.name, err.message);
					throw new Error("Unauthorized: " + err.message);
				}
			}

			throw new Error("Unauthorized: No token provided");
		},
		/*async authorize(ctx, route, req) {
			let token;
			// 1️⃣ Buscar en Authorization header
			if (req.headers.authorization) {
				let type = req.headers.authorization.split(" ")[0];
				if (type === "Token" || type === "Bearer")
					token = req.headers.authorization.split(" ")[1];
			}
			// 2️⃣ Si no hay header, buscar en cookies
			if (!token && req.headers.cookie) {
				const accessToken = req.headers.cookie.split(';').find(c => c.trim().startsWith("accessToken="));
				if (accessToken) {
					token = accessToken.split("=")[1];
				}
			}
			let user;
			if (token) {
				try {
					user = await ctx.call("users.resolveToken", { token });
					if (user) {
						this.logger.info("Authenticated via JWT: ", user.names);
						// Reduce user fields (it will be transferred to other nodes)
						ctx.meta.user = _.pick(user, [
							"_id",
							"names",
							"last_names",
							"idrol",
							"namerol",
							"email",
							"image",
							"token",
						]);
						ctx.meta.token = token;
						ctx.meta.userID = user._id;
					}
				} catch (err) {
					// Ignored because we continue processing if user doesn't exists
				}
			}
			if (req.$action.auth == "required" && !user)
				throw new UnAuthorizedError();
		},*/


		/*async authorize(ctx, route, req) {
			let token;
			if (req.headers.authorization) {
				let type = req.headers.authorization.split(" ")[0];
				if (type === "Token" || type === "Bearer")
					token = req.headers.authorization.split(" ")[1];
			}
			let user;
			if (token) {
				try {
					user = await ctx.call("users.resolveToken", { token });
					if (user) {
						this.logger.info("Authenticated via JWT: ", user.names);
						// Reduce user fields (it will be transferred to other nodes)
						ctx.meta.user = _.pick(user, [
							"_id",
							"names",
							"last_names",
							"idrol",
							"namerol",
							"email",
							"image",
							"token",
						]);
						ctx.meta.token = token;
						ctx.meta.userID = user._id;
					}
				} catch (err) {
					// Ignored because we continue processing if user doesn't exists
				}
			}
			if (req.$action.auth == "required" && !user)
				throw new UnAuthorizedError();
		},*/
	},
};
