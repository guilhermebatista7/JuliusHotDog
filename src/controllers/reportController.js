const { env } = require('../config/env');
const { success } = require('../utils/apiResponse');
const { getDashboardSummary } = require('../services/reportService');

async function getDashboard(req, res) {
  const report = await getDashboardSummary();
  return success(res, report, 'Relatorio carregado com sucesso.');
}

async function getPublicConfig(req, res) {
  return success(res, {
    whatsappNumber: env.whatsappNumber,
    deliveryFee: env.deliveryFee
  }, 'Configuracao publica carregada com sucesso.');
}

module.exports = { getDashboard, getPublicConfig };
