const orderRequestModel = require('../models/OrderRequestModel');
const productModel = require('../models/ProductModel');
const supplyModel = require('../models/SupplyModel');
const userModel = require('../models/UserModel');

function buildDateFilter({ month, year, fullYear } = {}) {
  const now = new Date();
  const selectedYear = Number(year || now.getFullYear());
  const selectedMonth = Number(month || now.getMonth() + 1);
  const useFullYear = fullYear === true || fullYear === 'true' || fullYear === '1';
  const startMonthIndex = useFullYear ? 0 : selectedMonth - 1;
  const endMonthIndex = useFullYear ? 12 : selectedMonth;

  return {
    month: selectedMonth,
    year: selectedYear,
    fullYear: useFullYear,
    startDate: new Date(Date.UTC(selectedYear, startMonthIndex, 1)).toISOString(),
    endDate: new Date(Date.UTC(selectedYear, endMonthIndex, 1)).toISOString()
  };
}

async function getDashboardSummary(filters = {}) {
  const dateFilter = buildDateFilter(filters);
  const [orderSummary, products, supplies, users] = await Promise.all([
    orderRequestModel.getAcceptedSummary(dateFilter),
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
    orders: orderSummary.orders || [],
    month: dateFilter.month,
    year: dateFilter.year,
    fullYear: dateFilter.fullYear
  };
}

module.exports = { getDashboardSummary };
