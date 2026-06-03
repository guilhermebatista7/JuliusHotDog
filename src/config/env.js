const env = {
  port: Number(process.env.PORT || 3000),
  supabaseUrl: process.env.SUPABASE_URL || 'https://vdeylgvupfnyangxyieu.supabase.co',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkZXlsZ3Z1cGZueWFuZ3h5aWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MzUwNjUsImV4cCI6MjA5NjAxMTA2NX0.PY3dAdm2Cx-tEqq8rSqC8aQVDZ5NgFC7OTbpj0fh7g0',
  jwtSecret: process.env.JWT_SECRET || 'troque-esta-chave-secreta',
  sessionSecret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'troque-esta-chave-secreta',
  whatsappNumber: process.env.WHATSAPP_NUMBER || '5511999999999',
  whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  whatsappBusinessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
  whatsappAccessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
  whatsappVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'julios_webhook_2026',
  juliusWhatsappNumber: process.env.JULIUS_WHATSAPP_NUMBER || '',
  deliveryFee: Number(process.env.DELIVERY_FEE || 5)
};

module.exports = { env };
