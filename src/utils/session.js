const crypto = require('crypto');
const { env } = require('../config/env');

const COOKIE_NAME = 'julios_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function base64Url(input) {
  return Buffer.from(input).toString('base64url');
}

function sign(value) {
  return crypto
    .createHmac('sha256', env.sessionSecret)
    .update(value)
    .digest('base64url');
}

function createSessionToken(user) {
  const payload = base64Url(JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  }));

  return `${payload}.${sign(payload)}`;
}

function parseSessionToken(token) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split('.');
  if (!payload || !signature || sign(payload) !== signature) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!session.exp || session.exp < Date.now()) {
      return null;
    }

    return session;
  } catch (error) {
    return null;
  }
}

function parseCookies(req) {
  return String(req.headers.cookie || '')
    .split(';')
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .reduce((cookies, cookie) => {
      const separator = cookie.indexOf('=');
      if (separator === -1) {
        return cookies;
      }

      cookies[cookie.slice(0, separator)] = decodeURIComponent(cookie.slice(separator + 1));
      return cookies;
    }, {});
}

function setSessionCookie(res, user) {
  const token = createSessionToken(user);
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS * 1000
  });
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax'
  });
}

module.exports = {
  COOKIE_NAME,
  clearSessionCookie,
  parseCookies,
  parseSessionToken,
  setSessionCookie
};
