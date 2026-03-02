const mongoose = require("mongoose");

const auditoriaSchema = new mongoose.Schema({
  fecha: { type: Date, default: Date.now },
  accion: String,
  usuario: String,
  detalle: Object
});

module.exports = mongoose.model("Auditoria", auditoriaSchema);
