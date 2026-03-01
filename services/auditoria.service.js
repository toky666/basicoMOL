"use strict";

const DbService = require("../mixins/db.mixin");

module.exports = {
  name: "auditoria",
  mixins: [DbService("auditoria")],

  settings: {
    rest: "/auditoria",
    fields: ["_id", "fecha", "servicio", "accion", "usuario", "detalle"],
  },

  actions: {
    // Obtener todos los registros
    list: {
      rest: "GET /",
      async handler(ctx) {
        return await this.adapter.find({});
      }
    },

    // Filtrar por servicio (ej: roles, usuarios)
    byService: {
      rest: "GET /:servicio",
      async handler(ctx) {
        return await this.adapter.find({ query: { servicio: ctx.params.servicio } });
      }
    },

    // Filtrar por usuario
    byUser: {
      rest: "GET /usuario/:usuario",
      async handler(ctx) {
        return await this.adapter.find({ query: { usuario: ctx.params.usuario } });
      }
    },

    // Últimos N registros
    last: {
      rest: "GET /last/:n",
      async handler(ctx) {
        const n = parseInt(ctx.params.n, 10) || 10;
        return await this.adapter.find({
          sort: "-fecha",
          limit: n
        });
      }
    }
  }
};
