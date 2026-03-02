const mongoose = require("mongoose");
const Auditoria = require("./auditoria.model");

const roleSchema = new mongoose.Schema({
  name: String,
  enabled: { type: Boolean, default: true },
  createdAt: String,
  updatedAt: String,
  usuario: String // opcional, si quieres guardar quién hizo la acción
});

// CREATE
roleSchema.post("save", async function(doc) {
  await Auditoria.create({
    servicio: "roles",
    accion: "CREATE",
    usuario: doc.usuario || "desconocido",
    detalle: doc
  });
});

// UPDATE
roleSchema.post("updateOne", async function(result) {
  const filtro = this.getFilter();
  const cambios = this.getUpdate();
  await Auditoria.create({
    servicio: "roles",
    accion: "UPDATE",
    usuario: cambios.usuario || "desconocido",
    detalle: { filtro, cambios }
  });
});

// DELETE
roleSchema.post("deleteOne", async function(result) {
  const filtro = this.getFilter();
  await Auditoria.create({
    servicio: "roles",
    accion: "REMOVE",
    usuario: "desconocido",
    detalle: filtro
  });
});

module.exports = mongoose.model("Role", roleSchema);
