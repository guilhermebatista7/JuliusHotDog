const orderModel = require('../models/OrderModel');
const productModel = require('../models/ProductModel');
const supplyModel = require('../models/SupplyModel');
const userModel = require('../models/UserModel');

function buildDateFilter({ month, year, startDate, endDate } = {}) {
  if (startDate || endDate) {
    const startsAt = startDate ? new Date(`${startDate}T00:00:00.000Z`) : null;
    const endsAt = endDate ? new Date(`${endDate}T00:00:00.000Z`) : null;

    return {
      startDate: startsAt ? startsAt.toISOString() : null,
      endDate: endsAt ? new Date(endsAt.getTime() + 24 * 60 * 60 * 1000).toISOString() : null,
      selectedStartDate: startDate || null,
      selectedEndDate: endDate || null
    };
  }

  const now = new Date();
  const selectedYear = Number(year || now.getFullYear());
  const selectedMonth = Number(month || now.getMonth() + 1);
  const monthStartDate = new Date(Date.UTC(selectedYear, selectedMonth - 1, 1)).toISOString();
  const monthEndDate = new Date(Date.UTC(selectedYear, selectedMonth, 1)).toISOString();

  return {
    month: selectedMonth,
    year: selectedYear,
    startDate: monthStartDate,
    endDate: monthEndDate
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
    year: dateFilter.year,
    startDate: dateFilter.selectedStartDate || null,
    endDate: dateFilter.selectedEndDate || null
  };
}

module.exports = { getDashboardSummary };
