const orderRequestModel = require('../models/OrderRequestModel');
const productModel = require('../models/ProductModel');
const supplyModel = require('../models/SupplyModel');
const userModel = require('../models/UserModel');

function localDateStart(year, month, day = 1) {
  const monthText = String(month).padStart(2, '0');
  const dayText = String(day).padStart(2, '0');
  return new Date(`${year}-${monthText}-${dayText}T00:00:00-03:00`);
}

function buildDateFilter({ period, date, month, year } = {}) {
  const now = new Date();
  const selectedPeriod = ['day', 'month', 'year'].includes(period) ? period : 'month';
  const selectedYear = Number(year || now.getFullYear());
  const selectedMonth = Number(month || now.getMonth() + 1);
  const selectedDate = /^\d{4}-\d{2}-\d{2}$/.test(date || '')
    ? date
    : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  let startDate;
  let endDate;

  if (selectedPeriod === 'day') {
    startDate = new Date(`${selectedDate}T00:00:00-03:00`);
    endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
  } else if (selectedPeriod === 'year') {
    startDate = localDateStart(selectedYear, 1);
    endDate = localDateStart(selectedYear + 1, 1);
  } else {
    startDate = localDateStart(selectedYear, selectedMonth);
    endDate = selectedMonth === 12
      ? localDateStart(selectedYear + 1, 1)
      : localDateStart(selectedYear, selectedMonth + 1);
  }

  return {
    period: selectedPeriod,
    date: selectedDate,
    month: selectedMonth,
    year: selectedYear,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
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
    averageTicket: orderSummary.totalOrders
      ? Number(orderSummary.totalRevenue || 0) / Number(orderSummary.totalOrders)
      : 0,
    totalProducts: products.length,
    totalSupplies: supplies.length,
    totalUsers: users.length,
    orders: orderSummary.orders || [],
    period: dateFilter.period,
    date: dateFilter.date,
    month: dateFilter.month,
    year: dateFilter.year
  };
}

module.exports = { getDashboardSummary };
