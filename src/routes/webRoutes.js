const express = require('express');

const webController = require('../controllers/webController');

const router = express.Router();

router.get('/', webController.home);
router.get('/login', webController.login);
router.get('/controle', webController.control);
router.get('/carrinho', webController.cart);

module.exports = router;
