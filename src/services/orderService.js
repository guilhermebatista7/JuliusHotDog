const { env } = require('../config/env');
const productModel = require('../models/ProductModel');
const orderModel = require('../models/OrderModel');
const orderRequestModel = require('../models/OrderRequestModel');
const HttpError = require('../utils/httpError');
const { sendOrderApprovalMessage } = require('./whatsappService');

function calculateLineTotal(unitPrice, quantity) {
  return Number(unitPrice) * Number(quantity);
}

async function buildOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, 'O pedido precisa ter ao menos um item.');
  }

  const detailedItems = [];

  for (const item of items) {
    const product = await productModel.findById(item.productId);
    if (!product || !product.active) {
      throw new HttpError(400, `Produto invalido para o item ${item.productId}.`);
    }

    const quantity = Number(item.quantity);
    if (!quantity || quantity < 1) {
      throw new HttpError(400, 'Quantidade invalida no pedido.');
    }

    if (product.stock_quantity !== null && product.stock_quantity !== undefined && Number(product.stock_quantity) < quantity) {
      throw new HttpError(400, `Estoque insuficiente para ${product.name}.`);
    }

    detailedItems.push({
      productId: product.id,
      productName: product.name,
      unitPrice: Number(product.price),
      quantity,
      currentStock: Number(product.stock_quantity ?? 0),
      lineTotal: calculateLineTotal(product.price, quantity)
    });
  }

  return detailedItems;
}

async function createOrder(payload) {
  const items = await buildOrderItems(payload.items);
  const subtotal = items.reduce((acc, item) => acc + item.lineTotal, 0);
  const deliveryFee = Number(payload.deliveryFee ?? env.deliveryFee);
  const total = subtotal + deliveryFee;

  const order = await orderModel.create({
    customerId: payload.customerId || null,
    customerName: payload.customerName || 'Cliente Julio\'s',
    customerEmail: payload.customerEmail || null,
    notes: payload.notes || '',
    subtotal,
    deliveryFee,
    total,
    status: payload.status || 'pending',
    items
  });

  for (const item of items) {
    await productModel.updateStock(item.productId, item.currentStock - item.quantity);
  }

  return order;
}

async function createOrderRequest(payload) {
  const items = await buildOrderItems(payload.items);
  const subtotal = items.reduce((acc, item) => acc + item.lineTotal, 0);
  const deliveryFee = Number(payload.deliveryFee ?? env.deliveryFee);
  const total = subtotal + deliveryFee;

  const orderRequest = await orderRequestModel.create({
    customerId: payload.customerId || null,
    customerName: payload.customerName || 'Cliente Julio\'s',
    customerEmail: payload.customerEmail || null,
    customerPhone: payload.customerPhone || null,
    notes: payload.notes || '',
    subtotal,
    deliveryFee,
    total,
    items
  });

  await sendOrderApprovalMessage(orderRequest);
  return orderRequest;
}

async function acceptOrderRequest(orderRequestId) {
  const orderRequest = await orderRequestModel.findById(orderRequestId);
  if (!orderRequest || orderRequest.status !== 'pending') {
    throw new HttpError(400, 'Solicitacao de pedido invalida.');
  }

  const order = await createOrder({
    customerId: orderRequest.customer_id,
    customerName: orderRequest.customer_name,
    customerEmail: orderRequest.customer_email,
    notes: orderRequest.notes,
    deliveryFee: orderRequest.delivery_fee,
    status: 'preparing',
    items: orderRequest.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity
    }))
  });

  await orderRequestModel.updateStatus(orderRequest.id, 'accepted', order.id);
  return { orderRequest, order };
}

async function denyOrderRequest(orderRequestId) {
  const orderRequest = await orderRequestModel.findById(orderRequestId);
  if (!orderRequest || orderRequest.status !== 'pending') {
    throw new HttpError(400, 'Solicitacao de pedido invalida.');
  }

  await orderRequestModel.updateStatus(orderRequest.id, 'denied');
  return orderRequest;
}

module.exports = {
  acceptOrderRequest,
  createOrder,
  createOrderRequest,
  denyOrderRequest
};
