const supplyModel = require('../models/SupplyModel');
const HttpError = require('../utils/httpError');
const { success } = require('../utils/apiResponse');

function mapSupplyPayload(body) {
  return {
    name: body.name,
    quantity: Number(body.quantity),
    unit: body.unit
  };
}

function validateSupplyPayload(payload) {
  if (!payload.name || Number.isNaN(payload.quantity) || !payload.unit) {
    throw new HttpError(400, 'Nome, quantidade e unidade sao obrigatorios.');
  }
}

async function listSupplies(req, res) {
  const supplies = await supplyModel.findAll('id DESC');
  return success(res, supplies, 'Insumos carregados com sucesso.');
}

async function getSupplyById(req, res) {
  const supply = await supplyModel.findById(req.params.id);
  if (!supply) {
    throw new HttpError(404, 'Insumo nao encontrado.');
  }

  return success(res, supply, 'Insumo encontrado.');
}

async function createSupply(req, res) {
  const payload = mapSupplyPayload(req.body);
  validateSupplyPayload(payload);

  const supply = await supplyModel.create(payload);
  return success(res, supply, 'Insumo criado com sucesso.', 201);
}

async function updateSupply(req, res) {
  const existingSupply = await supplyModel.findById(req.params.id);
  if (!existingSupply) {
    throw new HttpError(404, 'Insumo nao encontrado.');
  }

  const payload = mapSupplyPayload(req.body);
  validateSupplyPayload(payload);

  const supply = await supplyModel.update(req.params.id, payload);
  return success(res, supply, 'Insumo atualizado com sucesso.');
}

async function deleteSupply(req, res) {
  const deleted = await supplyModel.deleteById(req.params.id);
  if (!deleted) {
    throw new HttpError(404, 'Insumo nao encontrado.');
  }

  return success(res, null, 'Insumo removido com sucesso.');
}

module.exports = {
  listSupplies,
  getSupplyById,
  createSupply,
  updateSupply,
  deleteSupply
};
