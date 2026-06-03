const orderModel = require('../models/OrderModel');
const HttpError = require('../utils/httpError');
const { success } = require('../utils/apiResponse');
const { createOrder, createOrderRequest } = require('../services/orderService');

async function listOrders(req, res) {
  const orders = await orderModel.findAllDetailed();
  return success(res, orders, 'Pedidos carregados com sucesso.');
}

async function getOrderById(req, res) {
  const order = await orderModel.findDetailedById(req.params.id);
  if (!order) {
    throw new HttpError(404, 'Pedido nao encontrado.');
  }

  return success(res, order, 'Pedido encontrado.');
}

async function createNewOrder(req, res) {
  const order = await createOrder({
    ...req.body,
    customerId: req.user?.id || req.body.customerId,
    customerName: req.user?.name || req.body.customerName,
    customerEmail: req.user?.email || req.body.customerEmail
  });
  return success(res, order, 'Pedido criado com sucesso.', 201);
}

async function createNewOrderRequest(req, res) {
  const orderRequest = await createOrderRequest({
    ...req.body,
    customerId: req.user.id,
    customerName: req.user.name,
    customerEmail: req.user.email,
    customerPhone: req.user.phone
  });

  return success(res, orderRequest, 'Pedido enviado para aprovacao do Julius.', 201);
}

async function updateOrderStatus(req, res) {
  if (!req.body.status) {
    throw new HttpError(400, 'O status do pedido e obrigatorio.');
  }

  const existingOrder = await orderModel.findById(req.params.id);
  if (!existingOrder) {
    throw new HttpError(404, 'Pedido nao encontrado.');
  }

  const order = await orderModel.updateStatus(req.params.id, req.body.status);
  return success(res, order, 'Status do pedido atualizado com sucesso.');
}

async function deleteOrder(req, res) {
  const deleted = await orderModel.deleteOrder(req.params.id);
  if (!deleted) {
    throw new HttpError(404, 'Pedido nao encontrado.');
  }

  return success(res, null, 'Pedido removido com sucesso.');
}

module.exports = {
  listOrders,
  getOrderById,
  createNewOrder,
  createNewOrderRequest,
  updateOrderStatus,
  deleteOrder
};
