const express = require('express');

const asyncHandler = require('../middlewares/asyncHandler');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/', asyncHandler(productController.listProducts));
router.get('/:id', asyncHandler(productController.getProductById));
router.post('/', asyncHandler(productController.createProduct));
router.put('/:id', asyncHandler(productController.updateProduct));
router.patch('/:id/availability', asyncHandler(productController.updateProductAvailability));
router.delete('/:id', asyncHandler(productController.deleteProduct));

module.exports = router;
