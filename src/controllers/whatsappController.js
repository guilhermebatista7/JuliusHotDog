const { env } = require('../config/env');
const { acceptOrderRequest, denyOrderRequest } = require('../services/orderService');
const { sendSms } = require('../services/smsService');

function verifyWebhook(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === env.whatsappVerifyToken) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
}

function getButtonReplyId(payload) {
  const messages = payload.entry?.[0]?.changes?.[0]?.value?.messages || [];
  const message = messages[0];

  return message?.interactive?.button_reply?.id || null;
}

async function receiveWebhook(req, res) {
  const replyId = getButtonReplyId(req.body);

  if (!replyId) {
    return res.sendStatus(200);
  }

  const [, action, orderRequestId] = replyId.match(/^(accept|deny)_order_(\d+)$/) || [];
  if (!action || !orderRequestId) {
    return res.sendStatus(200);
  }

  if (action === 'accept') {
    const { orderRequest, order } = await acceptOrderRequest(orderRequestId);
    await sendSms(
      orderRequest.customer_phone,
      `Seu pedido #${order.id} foi aceito pelo Julius. Total: R$ ${Number(order.total).toFixed(2)}.`
    );
  }

  if (action === 'deny') {
    const orderRequest = await denyOrderRequest(orderRequestId);
    await sendSms(
      orderRequest.customer_phone,
      `Seu pedido #${orderRequest.id} foi negado pelo Julius.`
    );
  }

  return res.sendStatus(200);
}

module.exports = {
  receiveWebhook,
  verifyWebhook
};
