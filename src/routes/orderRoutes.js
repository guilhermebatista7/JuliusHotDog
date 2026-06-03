const express = require('express');

const asyncHandler = require('../middlewares/asyncHandler');
const orderController = require('../controllers/orderController');
const { requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', requireAdmin, asyncHandler(orderController.listOrders));
router.get('/:id', requireAdmin, asyncHandler(orderController.getOrderById));
router.post('/request', asyncHandler(orderController.createNewOrderRequest));
router.post('/', requireAdmin, asyncHandler(orderController.createNewOrder));
router.patch('/:id/status', requireAdmin, asyncHandler(orderController.updateOrderStatus));
router.delete('/:id', requireAdmin, asyncHandler(orderController.deleteOrder));

module.exports = router;
