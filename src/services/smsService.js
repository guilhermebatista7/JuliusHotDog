const { env } = require('../config/env');

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits ? `+${digits}` : '';
}

function hasTwilioConfig() {
  return Boolean(env.twilioAccountSid && env.twilioAuthToken && env.twilioFromNumber);
}

async function sendSms(to, message) {
  const toNumber = normalizePhone(to);

  if (!toNumber) {
    console.warn('[SMS] Usuario sem telefone cadastrado.');
    return;
  }

  if (!hasTwilioConfig()) {
    console.warn(`[SMS nao enviado] Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN e TWILIO_FROM_NUMBER. Para ${toNumber}: ${message}`);
    return;
  }

  const body = new URLSearchParams({
    To: toNumber,
    From: env.twilioFromNumber,
    Body: message
  });

  const auth = Buffer.from(`${env.twilioAccountSid}:${env.twilioAuthToken}`).toString('base64');
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.twilioAccountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  const payload = await response.json();
  if (!response.ok) {
    console.error('[SMS erro Twilio]', payload);
    return;
  }

  console.log(`[SMS enviado] ${payload.sid} para ${toNumber}`);
}

module.exports = { sendSms };
