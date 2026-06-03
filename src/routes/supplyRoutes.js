const express = require('express');

const asyncHandler = require('../middlewares/asyncHandler');
const supplyController = require('../controllers/supplyController');

const router = express.Router();

router.get('/', asyncHandler(supplyController.listSupplies));
router.get('/:id', asyncHandler(supplyController.getSupplyById));
router.post('/', asyncHandler(supplyController.createSupply));
router.put('/:id', asyncHandler(supplyController.updateSupply));
router.delete('/:id', asyncHandler(supplyController.deleteSupply));

module.exports = router;
