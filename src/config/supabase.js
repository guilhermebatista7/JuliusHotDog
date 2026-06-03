const { env } = require('./env');
const HttpError = require('../utils/httpError');

function buildUrl(table, query = {}) {
  const url = new URL(`${env.supabaseUrl}/rest/v1/${table}`);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  return url;
}

async function request(table, options = {}) {
  const {
    method = 'GET',
    query = {},
    body,
    prefer = 'return=representation'
  } = options;

  const response = await fetch(buildUrl(table, query), {
    method,
    headers: {
      apikey: env.supabaseAnonKey,
      Authorization: `Bearer ${env.supabaseAnonKey}`,
      'Content-Type': 'application/json',
      Prefer: prefer
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new HttpError(response.status, payload?.message || payload?.details || 'Nao foi possivel acessar o Supabase.');
  }

  return payload || [];
}

module.exports = { request };
