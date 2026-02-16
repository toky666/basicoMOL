"use strict";

const _ = require("lodash");
const ApiGateway = require("moleculer-web");
const { UnAuthorizedError } = ApiGateway.Errors;

module.exports = {
	name: "api",
	mixins: [ApiGateway],

	settings: {
		port: process.env.PORT || 3081,
		cors: true,
		routes: [
			{
				authorization: false,
				aliases: {
					"POST /users/login": "users.login",
					// "POST /staff/login/user": "staff.loginUser", // Johnson
					// "POST /staff/auth/user": "staff.auth", // Flav
					// "GET /invoice/report/:start/:end": "invoice.generateReport"// mar
				},
				mappingPolicy: "restrict",
				bodyParsers: {
					json: {
						strict: false
					},
					urlencoded: {
						extended: false
					}
				}
			},
            {
			path: "/api",

			authorization: false,
			autoAliases: true,

			// Set CORS headers
			cors: true,

			// Parse body content
			bodyParsers: {
				json: {
					strict: false
				},
				urlencoded: {
					extended: false
				}
			}
		},
		{
			path: "/upload",
			authorization: false,
			bodyParsers: {
				//json: false,
				urlencoded: false
			},
			aliases: {
				"GET /:folder/:file": "file.get",
				"GET /del/:folder/:file": "file.del",
				"POST /save/business": {
					type: "multipart",
					busboyConfig: {
						files: 3
					},
					action: "file.saveBusiness"
				},
				"POST /save/users": {
					type: "multipart",
					busboyConfig: {
						files: 3
					},
					action: "file.saveUsers"
				},
				"POST /save/animals": {
					type: "multipart",
					busboyConfig: {
						files: 3
					},
					action: "file.saveAnimals"
				},
				"POST /edit/users": {
                        type: "multipart",
                        // Action level busboy config
                        busboyConfig: {
                            limits: {
                                files: 3
                            }
                        },
                        action: "file.uploadFile"
                    },
			},

			// https://github.com/mscdex/busboy#busboy-methods
			busboyConfig: {
				limits: {
					files: 5
				}
			},

			callOptions: {
				meta: {
					a: 5
				}
			},

			mappingPolicy: "restrict"
		}

	],

		assets: {
			folder: "./public"
		},

		// logRequestParams: "info",
		// logResponseData: "info",

		onError(req, res, err) {
			// Return with the error as JSON object
			res.setHeader("Content-type", "application/json; charset=utf-8");
			res.writeHead(err.code || 500);

			if (err.code == 422) {
				let o = {};
				err.data.forEach(e => {
					let field = e.field.split(".").pop();
					o[field] = e.message;
				});

				res.end(JSON.stringify({ errors: o }, null, 2));
			} else {
				const errObj = _.pick(err, ["name", "message", "code", "type", "data"]);
				res.end(JSON.stringify(errObj, null, 2));
			}
			this.logResponse(req, res, err ? err.ctx : null);
		}

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
		async authorize(ctx, route, req) {
			let token;
			if (req.headers.authorization) {
				let type = req.headers.authorization.split(" ")[0];
				if (type === "Token" || type === "Bearer")
					token = req.headers.authorization.split(" ")[1];
			}

			let user;
			if (token) {
				// Verify JWT token
				try {
					user = await ctx.call("users.resolveToken", { token });
					if (user) {
						this.logger.info("Authenticated via JWT: ", user.names);
						// Reduce user fields (it will be transferred to other nodes)
						ctx.meta.user = _.pick(user, ["_id", "names","last_names","idrol","namerol", "email", "image","token"]);
						ctx.meta.token = token;
						ctx.meta.userID = user._id;
					}
				} catch (err) {
					// Ignored because we continue processing if user doesn't exists
				}
			}

			if (req.$action.auth == "required" && !user)
				throw new UnAuthorizedError();
		}
	}
};
