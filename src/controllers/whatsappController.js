const { env } = require('../config/env');
const { acceptOrderRequest, denyOrderRequest } = require('../services/orderService');
const {
  sendCustomerAcceptedMessage,
  sendCustomerDeniedMessage
} = require('../services/whatsappService');

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

  return message?.interactive?.button_reply?.id ||
    message?.button?.payload ||
    null;
}

async function receiveWebhook(req, res) {
  const replyId = getButtonReplyId(req.body);

  if (!replyId) {
    console.log('[WhatsApp webhook] Evento recebido sem botao de pedido.');
    return res.sendStatus(200);
  }

  const [, action, orderRequestId] = replyId.match(/^(accept|deny)_order_(\d+)$/) || [];
  if (!action || !orderRequestId) {
    console.log('[WhatsApp webhook] Botao ignorado:', replyId);
    return res.sendStatus(200);
  }

  console.log('[WhatsApp webhook] Acao recebida:', {
    action,
    orderRequestId
  });

  if (action === 'accept') {
    const { orderRequest, order } = await acceptOrderRequest(orderRequestId);
    await sendCustomerAcceptedMessage(orderRequest, order);
  }

  if (action === 'deny') {
    const orderRequest = await denyOrderRequest(orderRequestId);
    await sendCustomerDeniedMessage(orderRequest);
  }

  return res.sendStatus(200);
}

module.exports = {
  receiveWebhook,
  verifyWebhook
};
