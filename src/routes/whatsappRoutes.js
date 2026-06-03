const express = require('express');

const asyncHandler = require('../middlewares/asyncHandler');
const whatsappController = require('../controllers/whatsappController');

const router = express.Router();

router.get('/webhook', whatsappController.verifyWebhook);
router.post('/webhook', asyncHandler(whatsappController.receiveWebhook));

module.exports = router;
