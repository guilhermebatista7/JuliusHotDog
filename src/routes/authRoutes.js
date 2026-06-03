const express = require('express');

const asyncHandler = require('../middlewares/asyncHandler');
const authController = require('../controllers/authController');
const { requireAdmin, requireAuth } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.post('/logout', requireAuth, asyncHandler(authController.logout));
router.get('/me', requireAuth, asyncHandler(authController.me));
router.get('/users', requireAdmin, asyncHandler(authController.listUsers));
router.get('/users/:id', requireAdmin, asyncHandler(authController.getUserById));
router.put('/users/:id', requireAdmin, asyncHandler(authController.updateUser));
router.patch('/users/:id/password', requireAdmin, asyncHandler(authController.updatePassword));
router.delete('/users/:id', requireAdmin, asyncHandler(authController.deleteUser));

module.exports = router;
