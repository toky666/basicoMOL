const fs = require("fs");
const path = require("path");
//const { NotFoundError } = require("../utils/error");
//const mkdir = require("mkdirp").sync;
const mime = require("mime-types");

const uploadDir = path.join(__dirname, "../public/assets/images");
const nodemailer = require("nodemailer");

// var EmailTemplate = require('email-templates').EmailTemplate;
// var path = require('path');

// var templateDir = path.join(__dirname, 'templates', 'hello');
// console.log("vivi.... " + uploadDir);
//var uuidv4 = require("uuid/v4");
//mkdir(uploadDir);

//const { TheResize } = require('the-resize');

module.exports = {
	name: "email",
	// settings: {
	// 	// Sender default e-mail address
	// 	// from: null,

	// 	/* SMTP: https://nodemailer.com/smtp/
	// 	transport: {
	// 		host: "smtp.mailtrap.io",
	// 		port: 2525,
	// 		auth: {
	// 			user: "",
	// 			pass: ""
	// 		}
	// 	},
	// 	*/

	// 	/* for Gmail service - https://github.com/nodemailer/nodemailer/blob/master/lib/well-known/services.json
	// 	 */
	// 	from: "sender@moleculer.services",
	// 	transport: {
	// 		service: "gmail",
	// 		auth: {
	// 			user: "dacorpinfo20@gmail.com",
	// 			pass: "info2020",
	// 		},
	// 	},

	// 	// Convert HTML body to text
	// 	htmlToText: true,

	// 	// Templates folder
	// 	templateFolder: null,

	// 	// Common data
	// 	data: {},
	// },
	actions: {
		send: {
			rest: "POST /sendmail",
			cache: false,
			params: {
				data: { type: "object" },
			},
			async handler(ctx) {
				let entity = ctx.params.data;
				// let testAccount = await nodemailer.createTestAccount();

				// create reusable transporter object using the default SMTP transport
				let transporter = nodemailer.createTransport({
					host: "smtp.gmail.com",
					port: 587,
					secure: false, // true for 465, false for other ports
					auth: {
						user: "yokycoronelchavez@gmail.com", // generated ethereal user
						pass: "momusu000", // generated ethereal password
					},
				});

				// send mail with defined transport object
				// built-in renderer

				let info = await transporter.sendMail({
					from: '"Cat Security 👻"', // sender address
					to: entity.email, // list of receivers
					subject: "Hello ✔", // Subject line
					text: "Hello world1?", // plain text body
					//html: "<b>Hello world2?</b></br> <b>Hello world2?</b></br>", // html body
					// html: `Se registro correctamente...</br>
					// <b>Usuario: ${entity.email}</b></br>
					// <b>Password: ${entity.password}</b> </br>`
					// html: { path: "./view/index.html"},
					html: `
						<style>
						.newsletter-blog-ad{
							width: 70%;
							background-color: #fff;
							padding: 70px;
							background-color: #3b41a7;
							border-radius: 10px;
							color: #ffffff;
						}
						.newsletter-blog-ad p span {
							font-size: 26px;
							font-weight: 900;
							letter-spacing: 1px;
							line-height: 1.8;
						}
						.blue-color {
							color: #44dcfa;
						}

						._2vreQC5gkI3XCcLRq638aT {
							-webkit-box-flex: 0;
							-ms-flex: 0 0 auto;
							flex: 0 0 auto;
							display: -webkit-box;
							display: -ms-flexbox;
							display: flex;
							-webkit-box-orient: horizontal;
							-webkit-box-direction: normal;
							-ms-flex-flow: row;
							flex-flow: row;
							-webkit-box-pack: justify;
							-ms-flex-pack: justify;
							justify-content: space-between;
							-webkit-box-align: center;
							-ms-flex-align: center;
							align-items: center;
						}
						</style>
						<div class="newsletter-blog-ad">
						<div id="subscribe-screen">
						  <div class="newsletter-content">
							<p><span class="blue-color"> Su suscripción a nuestra lista ha sido confirmada.</span></p>
							<h3>Para sus registros, aquí hay una copia de la información que nos envió ...  </h3>
							<h3>Se recomienda cambiar de contraseña cuando ingrese al sistema</h3>
						  </div>
						  <ul class="x_profile-list" style="display:block; margin:15px 20px; padding:0; list-style:none; border-top:1px solid #eee"><li style="display:block; margin:0; padding:5px 0; border-bottom:1px solid #eee"><strong><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">Usuario: </font></font></strong><font style="vertical-align: inherit;"><font style="vertical-align: inherit;"> ${entity.email} </font></font></li></ul></br>
						  <ul class="x_profile-list" style="display:block; margin:15px 20px; padding:0; list-style:none; border-top:1px solid #eee"><li style="display:block; margin:0; padding:5px 0; border-bottom:1px solid #eee"><strong><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">Password: </font></font></strong><font style="vertical-align: inherit;"><font style="vertical-align: inherit;"> ${entity.password} </font></font></li></ul>
						  </div>
					  </div>`,
					//html: "<style>div { color:red; }</style><div>Hello world!</div>",
				});
			},
		},
		sendContrasena: {
			rest: "POST /sendcontrasena",
			cache: false,
			params: {
				data: { type: "object" },
			},
			async handler(ctx) {
				let entity = ctx.params.data;
				// let testAccount = await nodemailer.createTestAccount();

				// create reusable transporter object using the default SMTP transport
				let transporter = nodemailer.createTransport({
					host: "smtp.gmail.com",
					port: 587,
					secure: false, // true for 465, false for other ports
					auth: {
						user: "yokycoronelchavez@gmail.com", // generated ethereal user
						pass: "momusu000", // generated ethereal password
					},
				});

				// send mail with defined transport object
				// built-in renderer

				let info = await transporter.sendMail({
					from: '"Cat Security 👻"', // sender address
					to: entity.email, // list of receivers
					subject: "Hello ✔", // Subject line
					text: "Hello world1?", // plain text body
					//html: "<b>Hello world2?</b></br> <b>Hello world2?</b></br>", // html body
					// html: `Se registro correctamente...</br>
					// <b>Usuario: ${entity.email}</b></br>
					// <b>Password: ${entity.password}</b> </br>`
					//html: { path: "./view/index.html"},
					html: `
						<style>
						.newsletter-blog-ad{
							width: 70%;
							background-color: #fff;
							padding: 70px;
							background-color: #E91E63;
							border-radius: 10px;
							color: #ffffff;
						}
						.newsletter-blog-ad p span {
							font-size: 26px;
							font-weight: 900;
							letter-spacing: 1px;
							line-height: 1.8;
						}
						.blue-color {
							color: #F8BBD0;
						}

						._2vreQC5gkI3XCcLRq638aT {
							-webkit-box-flex: 0;
							-ms-flex: 0 0 auto;
							flex: 0 0 auto;
							display: -webkit-box;
							display: -ms-flexbox;
							display: flex;
							-webkit-box-orient: horizontal;
							-webkit-box-direction: normal;
							-ms-flex-flow: row;
							flex-flow: row;
							-webkit-box-pack: justify;
							-ms-flex-pack: justify;
							justify-content: space-between;
							-webkit-box-align: center;
							-ms-flex-align: center;
							align-items: center;
						}
						</style>
						<div class="newsletter-blog-ad">
						<div id="subscribe-screen">
						  <div class="newsletter-content">
							<p><span class="blue-color"> Se actualizo su email y su contraseña</span></p>
							<h3>Aquí hay una copia de la información que nos envió ...  </h3>
							<h3>Se recomienda cambiar de contraseña cuando ingrese al sistema</h3>
						  </div>
						  <ul class="x_profile-list" style="display:block; margin:15px 20px; padding:0; list-style:none; border-top:1px solid #eee"><li style="display:block; margin:0; padding:5px 0; border-bottom:1px solid #eee"><strong><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">Usuario: </font></font></strong><font style="vertical-align: inherit;"><font style="vertical-align: inherit;"> ${entity.email} </font></font></li></ul></br>
						  <ul class="x_profile-list" style="display:block; margin:15px 20px; padding:0; list-style:none; border-top:1px solid #eee"><li style="display:block; margin:0; padding:5px 0; border-bottom:1px solid #eee"><strong><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">Password: </font></font></strong><font style="vertical-align: inherit;"><font style="vertical-align: inherit;"> ${entity.password} </font></font></li></ul>
						  </div>
					  </div>`,
				});
			},
		},
	},

	/**
	 * Methods
	 */
	methods: {},
};
