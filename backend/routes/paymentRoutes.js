const express = require('express');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Webhook route - raw body handled in app.js
router.post('/webhook', paymentController.handleWebhook);

// Protected routes
router.use(authMiddleware);

// Create payment intent
router.post('/create-intent', paymentController.createPaymentIntent);

// Process refund
router.post('/refund', paymentController.refund);

// Get payment status
router.get('/:orderId/status', paymentController.getPaymentStatus);

module.exports = router;