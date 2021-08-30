const express = require("express");
const {listarContas, criarConta, atualizarUsuarioConta, deletarConta, deposito, sacar, transferir, saldo, extrato} = require("./src/controladores/controladores");
const rotas = express();

rotas.get("/contas", listarContas);
rotas.post("/contas", criarConta);
rotas.put("/contas/:numeroConta/usuario", atualizarUsuarioConta);
rotas.delete("/contas/:numeroConta", deletarConta);
rotas.post("/transacoes/depositar", deposito);
rotas.post("/transacoes/sacar", sacar);
rotas.post("/transacoes/transferir", transferir);
rotas.get("/contas/saldo", saldo);
rotas.get("/contas/extrato", extrato);

module.exports = rotas;