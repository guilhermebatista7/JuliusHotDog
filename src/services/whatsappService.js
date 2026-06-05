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
    console.error('[WhatsApp] Falha ao enviar mensagem:', {
      status: response.status,
      to: payload.to,
      type: payload.type,
      template: payload.template?.name,
      error: data?.error
    });
    throw new HttpError(response.status, data?.error?.message || 'Nao foi possivel enviar mensagem no WhatsApp.');
  }

  console.log('[WhatsApp] Mensagem enviada:', {
    to: payload.to,
    type: payload.type,
    template: payload.template?.name,
    messageId: data?.messages?.[0]?.id
  });

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

function buildOrderItemsText(orderRequest) {
  return orderRequest.items
    .map((item) => `${item.quantity}x ${item.productName}`)
    .join(', ');
}

function buildTemplateMessage(orderRequest) {
  return {
    messaging_product: 'whatsapp',
    to: env.juliusWhatsappNumber,
    type: 'template',
    template: {
      name: env.whatsappOrderTemplateName,
      language: {
        code: env.whatsappTemplateLanguage
      },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: orderRequest.customer_name },
            { type: 'text', text: buildOrderItemsText(orderRequest) },
            { type: 'text', text: `R$ ${Number(orderRequest.total).toFixed(2)}` },
            { type: 'text', text: orderRequest.notes || 'Nenhuma' }
          ]
        },
        {
          type: 'button',
          sub_type: 'quick_reply',
          index: '0',
          parameters: [
            { type: 'payload', payload: `accept_order_${orderRequest.id}` }
          ]
        },
        {
          type: 'button',
          sub_type: 'quick_reply',
          index: '1',
          parameters: [
            { type: 'payload', payload: `deny_order_${orderRequest.id}` }
          ]
        }
      ]
    }
  };
}

function buildInteractiveMessage(orderRequest) {
  return {
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
  };
}

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return digits;
}

async function sendCustomerTemplateMessage(to, templateName, parameters) {
  const toNumber = normalizePhone(to);

  if (!toNumber) {
    throw new HttpError(400, 'Cliente sem telefone cadastrado para receber feedback no WhatsApp.');
  }

  if (!templateName) {
    throw new HttpError(500, `Template de feedback nao configurado para enviar ao cliente ${toNumber}.`);
  }

  console.log('[WhatsApp feedback] Enviando feedback ao cliente:', {
    to: toNumber,
    template: templateName,
    language: env.whatsappTemplateLanguage
  });

  return sendWhatsAppMessage({
    messaging_product: 'whatsapp',
    to: toNumber,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: env.whatsappTemplateLanguage
      },
      components: [
        {
          type: 'body',
          parameters: parameters.map((text) => ({
            type: 'text',
            text: String(text)
          }))
        }
      ]
    }
  });
}

async function sendCustomerAcceptedMessage(orderRequest, order) {
  return sendCustomerTemplateMessage(orderRequest.customer_phone, env.whatsappAcceptedTemplateName, [
    orderRequest.customer_name,
    `#${order.id}`,
    `R$ ${Number(order.total).toFixed(2)}`
  ]);
}

async function sendCustomerDeniedMessage(orderRequest) {
  return sendCustomerTemplateMessage(orderRequest.customer_phone, env.whatsappDeniedTemplateName, [
    orderRequest.customer_name,
    `#${orderRequest.id}`
  ]);
}

async function sendOrderApprovalMessage(orderRequest) {
  const payload = env.whatsappOrderTemplateName
    ? buildTemplateMessage(orderRequest)
    : buildInteractiveMessage(orderRequest);

  return sendWhatsAppMessage(payload);
}

module.exports = {
  sendCustomerAcceptedMessage,
  sendCustomerDeniedMessage,
  sendOrderApprovalMessage
};
