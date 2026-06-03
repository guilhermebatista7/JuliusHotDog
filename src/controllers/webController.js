const path = require('path');

function sendPage(res, relativePath) {
  return res.sendFile(path.join(__dirname, '..', '..', relativePath));
}

function home(req, res) {
  return sendPage(res, 'index.html');
}

function login(req, res) {
  return sendPage(res, path.join('pages', 'login.html'));
}

function control(req, res) {
  return sendPage(res, path.join('pages', 'controle.html'));
}

function cart(req, res) {
  return sendPage(res, path.join('pages', 'carrinho.html'));
}

module.exports = {
  home,
  login,
  control,
  cart
};
