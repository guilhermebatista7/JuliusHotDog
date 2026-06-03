const express = require('express');

const asyncHandler = require('../middlewares/asyncHandler');
const reportController = require('../controllers/reportController');
const { requireAdmin, requireAuth } = require('../middlewares/auth');

const router = express.Router();

router.get('/dashboard', requireAdmin, asyncHandler(reportController.getDashboard));
router.get('/public-config', requireAuth, asyncHandler(reportController.getPublicConfig));

module.exports = router;
