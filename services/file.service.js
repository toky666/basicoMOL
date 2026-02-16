const fs = require("fs");
const path = require("path");
//const { NotFoundError } = require("../utils/error");
//const mkdir = require("mkdirp").sync;
const mime = require("mime-types");

const uploadDir = path.join(__dirname, "../public/assets/images");
// console.log("vivi.... " + uploadDir);
//var uuidv4 = require("uuid/v4");
//mkdir(uploadDir);

//const { TheResize } = require('the-resize');

module.exports = {
	name: "file",
	actions: {
		image: {
			cache: false,
			handler(ctx) {
				ctx.meta.$responseType = "image/png";
				// Return as stream
				// console.log("PATH::1: " + path.join(__dirname, "full", "assets", "images", "logo.png"));
				return fs.createReadStream(
					path.join(__dirname, "full", "assets", "images", "logo.png")
				);
			},
		},

		html: {
			cache: false,
			handler(ctx) {
				ctx.meta.$responseType = "text/html";
				return Buffer.from(
					`<html><body><h1>Hello API Gateway!</h1><img src="/api/file.image" /></body></html>`
				);
			},
		},

		get: {
			cache: false,
			handler(ctx) {
				// console.log("path:::: " + uploadDir);
				// console.log(ctx.params);
				const uploadDir = path.join(
					__dirname,
					"../public/assets/images/" + ctx.params.folder
				);
				const filePath = path.join(uploadDir, ctx.params.file);
				if (!fs.existsSync(filePath)) return new NotFoundError();
				ctx.meta.$responseType = mime.lookup(ctx.params.file);
				// Return as stream
				return fs.createReadStream(filePath);
			},
		},
		del: {
			cache: false,
			handler(ctx) {
				const uploadDir = path.join(
					__dirname,
					"../public/assets/images/" + ctx.params.folder
				);
				const filePath = path.join(uploadDir, ctx.params.file);
				if (!fs.existsSync(filePath)) return new NotFoundError();
				ctx.meta.$responseType = mime.lookup(ctx.params.file);

				fs.unlink(filePath, (err) => {
					if (err) {
						console.error(err);
						return new NotFoundError({
							msg: "No se pudo actualizar el producto",
						});
					}
					return { eliminado: "ok" };
					//file removed
				});
			},
		},
		uploadFile: {
            handler(ctx) {
                console.log(ctx.params)
                return new this.Promise((resolve, reject) => {
                    console.log(ctx.params)
					//reject(new Error("Disk out of space"));
					const uploadDir = path.join(
						__dirname,
						"../public/assets/images/" + ctx.params.folder
					);
                    const filePath = path.join(uploadDir, ctx.meta.filename || this.randomName());
                    const f = fs.createWriteStream(filePath);
                    f.on("close", () => {
                        this.logger.info(`Uploaded file stored in '${filePath}'`);
                        resolve({ filePath, meta: ctx.meta });
                    });
                    f.on("error", err => reject(err));

                    ctx.params.pipe(f);
                });
            }},
		saveUsers: {
			cache: false,
			// params: {
			//     folder: { type: "string", optional: true }
			// },
			handler(ctx) {
				console.log(ctx.meta.filename);
				return new this.Promise((resolve, reject) => {
					let arr = (ctx.meta.filename + "").split(".");
					let ext = arr[arr.length - 1];
					const name =
						Math.random().toString(36).substring(2) +
						Math.random().toString(36).substring(2) +
						"." +
						ext;
					const uploadDir = path.join(
						__dirname,
						"../public/assets/images/users"
					);
					if (!fs.existsSync(uploadDir)) {
						fs.mkdirSync(uploadDir);
					}
					const filePath = path.join(uploadDir, name);
					const f = fs.createWriteStream(filePath);
					f.on("close", () => {
						resolve({ name: name });
						//resolve({ success: true, msg: "Actualizado Correctamente!!", name: name });
					});
					f.on("error", (err) => reject(err));
					ctx.params.pipe(f);
				});
			},
		},
		saveBusiness: {
			cache: false,
			// params: {
			//     folder: { type: "string", optional: true }
			// },
			handler(ctx) {
				console.log(ctx.meta.filename);
				return new this.Promise((resolve, reject) => {
					let arr = (ctx.meta.filename + "").split(".");
					let ext = arr[arr.length - 1];
					const name =
						Math.random().toString(36).substring(2) +
						Math.random().toString(36).substring(2) +
						"." +
						ext;
					const uploadDir = path.join(
						__dirname,
						"../public/assets/images/business"
					);
					if (!fs.existsSync(uploadDir)) {
						fs.mkdirSync(uploadDir);
					}
					const filePath = path.join(uploadDir, name);
					const f = fs.createWriteStream(filePath);
					f.on("close", () => {
						resolve({ name: name });
						//resolve({ success: true, msg: "Actualizado Correctamente!!", name: name });
					});
					f.on("error", (err) => reject(err));
					ctx.params.pipe(f);
				});
			},
		},
		saveAnimals: {
			cache: false,
			// params: {
			//     folder: { type: "string", optional: true }
			// },
			handler(ctx) {
				console.log(ctx.meta.filename);
				return new this.Promise((resolve, reject) => {
					let arr = (ctx.meta.filename + "").split(".");
					let ext = arr[arr.length - 1];
					const name =
						Math.random().toString(36).substring(2) +
						Math.random().toString(36).substring(2) +
						"." +
						ext;
					const uploadDir = path.join(
						__dirname,
						"../public/assets/images/animals"
					);
					if (!fs.existsSync(uploadDir)) {
						fs.mkdirSync(uploadDir);
					}
					const filePath = path.join(uploadDir, name);
					const f = fs.createWriteStream(filePath);
					f.on("close", () => {
						resolve({ name: name });
						//resolve({ success: true, msg: "Actualizado Correctamente!!", name: name });
					});
					f.on("error", (err) => reject(err));
					ctx.params.pipe(f);
				});
			},
		},
	},
	methods: {
		randomName() {
			var uID = uuidv4();
			return uID + ".png";
		},

		updateFile(id_product, newName, callback) {
			let Product = require("mongoose").model("Product");
			Product.findOneAndUpdate(
				{ _id: id_product },
				{ $set: { image_item: newName } },
				(err, docs) => {
					if (err) {
						callback({
							success: false,
							msg: "No se pudo actualizar el producto",
							data: null,
						});
					}
					callback({
						success: true,
						msg: "Actualizado Correctamente!!",
						data: docs,
					});
				}
			);
		},

		renameFile(nameFile) {
			// console.log("renameFile: " + nameFile);
			let original = nameFile;
			let pathOld = path.join(uploadDir, nameFile);
			let pathNew = path.join(uploadDir, "src_" + nameFile);
			fs.rename(pathOld, pathNew, (err) => {
				if (err) throw err;
				// console.log('File Renamed.');
				this.resizeImage(pathOld, pathNew);
			});
		},

		resizeImage(oldFile, newFile) {
			this.tryExample(newFile, oldFile).catch((err) => console.error(err));
		},

		async tryExample(fileSRC, finalFile) {
			const resize = new TheResize({
				width: 200,

				fit: "fill", //('cover','contain','fill', 'inside' or 'outside')
				height: 200,
			});
			// Resize image to size fit inside 200x200
			await resize.convert(fileSRC, finalFile);
		},
	},
};
