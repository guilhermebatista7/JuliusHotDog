const orderModel = require('../models/OrderModel');
const productModel = require('../models/ProductModel');
const supplyModel = require('../models/SupplyModel');
const userModel = require('../models/UserModel');

async function getDashboardSummary() {
  const [orderSummary, products, supplies, users] = await Promise.all([
    orderModel.getSummary(),
    productModel.findAll('id DESC'),
    supplyModel.findAll('id DESC'),
    userModel.findAllSafe()
  ]);

  return {
    revenue: Number(orderSummary.totalRevenue || 0),
    totalOrders: Number(orderSummary.totalOrders || 0),
    totalProducts: products.length,
    totalSupplies: supplies.length,
    totalUsers: users.length
  };
}

module.exports = { getDashboardSummary };
