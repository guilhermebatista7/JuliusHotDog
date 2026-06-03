const express = require('express');

const productRoutes = require('./productRoutes');
const supplyRoutes = require('./supplyRoutes');
const authRoutes = require('./authRoutes');
const orderRoutes = require('./orderRoutes');
const reportRoutes = require('./reportRoutes');
const whatsappRoutes = require('./whatsappRoutes');
const { requireAdmin, requireAuth } = require('../middlewares/auth');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/products', requireAuth, productRoutes);
router.use('/supplies', requireAdmin, supplyRoutes);
router.use('/orders', requireAuth, orderRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
