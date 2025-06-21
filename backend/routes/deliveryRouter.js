const express = require('express');
const deliveryController = require('../controllers/deliveryController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Public routes (no authentication required)
router.get('/delivery/options', deliveryController.getDeliveryOptions);
router.post('/delivery/calculate', deliveryController.calculateDelivery);
router.get('/delivery/relay-points', deliveryController.getRelayPoints);

// Protected routes (require authentication)
router.post('/delivery/track', authenticate, deliveryController.trackDelivery);

// Webhook endpoint (for carrier updates - typically secured with webhook secret)
router.post('/delivery/webhook/carrier', deliveryController.handleCarrierWebhook);

module.exports = router;