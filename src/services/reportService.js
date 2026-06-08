const orderModel = require('../models/OrderModel');
const productModel = require('../models/ProductModel');
const supplyModel = require('../models/SupplyModel');
const userModel = require('../models/UserModel');

function buildDateFilter({ month, year } = {}) {
  const now = new Date();
  const selectedYear = Number(year || now.getFullYear());
  const selectedMonth = Number(month || now.getMonth() + 1);
  const startDate = new Date(Date.UTC(selectedYear, selectedMonth - 1, 1)).toISOString();
  const endDate = new Date(Date.UTC(selectedYear, selectedMonth, 1)).toISOString();

  return {
    month: selectedMonth,
    year: selectedYear,
    startDate,
    endDate
  };
}

async function getDashboardSummary(filters = {}) {
  const dateFilter = buildDateFilter(filters);
  const [orderSummary, products, supplies, users] = await Promise.all([
    orderModel.getSummary(dateFilter),
    productModel.findAll('id DESC'),
    supplyModel.findAll('id DESC'),
    userModel.findAllSafe()
  ]);

  return {
    revenue: Number(orderSummary.totalRevenue || 0),
    totalOrders: Number(orderSummary.totalOrders || 0),
    totalProducts: products.length,
    totalSupplies: supplies.length,
    totalUsers: users.length,
    month: dateFilter.month,
    year: dateFilter.year
  };
}

module.exports = { getDashboardSummary };
