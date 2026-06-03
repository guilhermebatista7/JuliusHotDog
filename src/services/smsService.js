async function sendSms(to, message) {
  if (!to) {
    return;
  }

  console.log(`[SMS pendente de provedor] Para ${to}: ${message}`);
}

module.exports = { sendSms };
