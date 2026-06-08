const productModel = require('../models/ProductModel');
const supplyModel = require('../models/SupplyModel');
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

    detailedItems.push({
      productId: product.id,
      productName: product.name,
      unitPrice: Number(product.price),
      quantity,
      lineTotal: calculateLineTotal(product.price, quantity),
      supplies: product.supplies || []
    });
  }

  return detailedItems;
}

async function buildSupplyUsage(items) {
  const supplyIds = [
    ...new Set(items.flatMap((item) => item.supplies.map((supply) => Number(supply.supply_id))))
  ].filter(Boolean);

  const supplies = await supplyModel.findByIds(supplyIds);
  const suppliesById = supplies.reduce((acc, supply) => {
    acc[supply.id] = supply;
    return acc;
  }, {});

  return items.reduce((acc, item) => {
    item.supplies.forEach((requirement) => {
      if (!requirement.required) {
        return;
      }

      const supplyId = Number(requirement.supply_id);
      const supply = suppliesById[supplyId];
      if (!supply) {
        acc.missing.push(`insumo nao cadastrado para ${item.productName}`);
        return;
      }

      if (supply.is_boolean) {
        if (!supply.available) {
          acc.missing.push(supply.name);
        }
        return;
      }

      const needed = Number(requirement.quantity_required || 0) * item.quantity;
      const existing = acc.unitUsage[supplyId] || {
        supply,
        needed: 0
      };
      existing.needed += needed;
      acc.unitUsage[supplyId] = existing;
    });

    return acc;
  }, { missing: [], unitUsage: {} });
}

async function ensureSuppliesAvailable(items) {
  const usage = await buildSupplyUsage(items);
  const missing = [...usage.missing];

  Object.values(usage.unitUsage).forEach(({ supply, needed }) => {
    if (Number(supply.quantity) < needed) {
      missing.push(`${supply.name} (${needed} necessario, ${Number(supply.quantity)} disponivel)`);
    }
  });

  if (missing.length > 0) {
    throw new HttpError(400, `Nao foi possivel enviar o pedido. Insumos faltantes: ${missing.join(', ')}.`);
  }

  return usage;
}

async function debitSupplies(items) {
  const usage = await ensureSuppliesAvailable(items);

  for (const { supply, needed } of Object.values(usage.unitUsage)) {
    await supplyModel.updateQuantity(supply.id, Number(supply.quantity) - needed);
  }
}

async function createOrder(payload) {
  const items = await buildOrderItems(payload.items);
  await debitSupplies(items);
  const subtotal = items.reduce((acc, item) => acc + item.lineTotal, 0);
  const deliveryFee = 0;
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

  return order;
}

async function createOrderRequest(payload) {
  const items = await buildOrderItems(payload.items);
  await ensureSuppliesAvailable(items);
  const subtotal = items.reduce((acc, item) => acc + item.lineTotal, 0);
  const deliveryFee = 0;
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
