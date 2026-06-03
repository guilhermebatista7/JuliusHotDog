const HttpError = require('../utils/httpError');
const { COOKIE_NAME, parseCookies, parseSessionToken } = require('../utils/session');

function attachSession(req, _res, next) {
  const cookies = parseCookies(req);
  req.user = parseSessionToken(cookies[COOKIE_NAME]);
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    if (!req.originalUrl.startsWith('/api') && req.accepts('html')) {
      return res.redirect('/login');
    }

    throw new HttpError(401, 'Login obrigatorio.');
  }

  return next();
}

function requireAdmin(req, _res, next) {
  if (!req.user) {
    throw new HttpError(401, 'Login obrigatorio.');
  }

  if (req.user.role !== 'admin') {
    throw new HttpError(403, 'Acesso permitido apenas para administrador.');
  }

  return next();
}

function protectHtmlPages(req, res, next) {
  if (req.method !== 'GET') {
    return next();
  }

  const protectedPaths = new Set([
    '/',
    '/index.html',
    '/pages/cardapio.html',
    '/pages/carrinho.html',
    '/pages/controle.html',
    '/cardapio',
    '/carrinho',
    '/controle'
  ]);

  if (!protectedPaths.has(req.path)) {
    return next();
  }

  if (!req.user) {
    return res.redirect('/login');
  }

  if ((req.path === '/pages/controle.html' || req.path === '/controle') && req.user.role !== 'admin') {
    return res.redirect('/');
  }

  return next();
}

module.exports = {
  attachSession,
  protectHtmlPages,
  requireAdmin,
  requireAuth
};
