const { env } = require('../config/env');
const HttpError = require('../utils/httpError');

function assertWhatsAppConfig() {
  if (!env.whatsappPhoneNumberId || !env.whatsappAccessToken || !env.juliusWhatsappNumber) {
    throw new HttpError(500, 'WhatsApp Cloud API nao configurado.');
  }
}

async function sendWhatsAppMessage(payload) {
  assertWhatsAppConfig();

  const response = await fetch(`https://graph.facebook.com/v20.0/${env.whatsappPhoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.whatsappAccessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new HttpError(response.status, data?.error?.message || 'Nao foi possivel enviar mensagem no WhatsApp.');
  }

  return data;
}

function buildOrderSummary(orderRequest) {
  const lines = orderRequest.items.map((item) => `${item.quantity}x ${item.productName} - R$ ${Number(item.lineTotal).toFixed(2)}`);

  return [
    `Pedido #${orderRequest.id}`,
    `Cliente: ${orderRequest.customer_name}`,
    `Telefone: ${orderRequest.customer_phone || 'Nao informado'}`,
    `Email: ${orderRequest.customer_email || 'Nao informado'}`,
    '',
    ...lines,
    '',
    `Observacoes: ${orderRequest.notes || 'Nenhuma'}`,
    `Total: R$ ${Number(orderRequest.total).toFixed(2)}`
  ].join('\n');
}

async function sendOrderApprovalMessage(orderRequest) {
  return sendWhatsAppMessage({
    messaging_product: 'whatsapp',
    to: env.juliusWhatsappNumber,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text: buildOrderSummary(orderRequest)
      },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: {
              id: `accept_order_${orderRequest.id}`,
              title: 'Aceitar'
            }
          },
          {
            type: 'reply',
            reply: {
              id: `deny_order_${orderRequest.id}`,
              title: 'Negar'
            }
          }
        ]
      }
    }
  });
}

module.exports = { sendOrderApprovalMessage };
