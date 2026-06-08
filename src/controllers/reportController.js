const { env } = require('../config/env');
const { success } = require('../utils/apiResponse');
const { getDashboardSummary } = require('../services/reportService');

async function getDashboard(req, res) {
  const report = await getDashboardSummary({
    month: req.query.month,
    year: req.query.year
  });
  return success(res, report, 'Relatorio carregado com sucesso.');
}

async function getPublicConfig(req, res) {
  return success(res, {
    whatsappNumber: env.whatsappNumber,
    deliveryFee: 0
  }, 'Configuracao publica carregada com sucesso.');
}

module.exports = { getDashboard, getPublicConfig };
