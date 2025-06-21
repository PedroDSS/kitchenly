const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validators/orderValidator');

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// User order routes
router.post('/orders', validateOrder.create, orderController.createOrder);
router.get('/orders', orderController.getMyOrders);
router.get('/orders/:id', orderController.getOrder);
router.post('/orders/:id/cancel', orderController.cancelOrder);
router.post('/orders/:id/return', validateOrder.return, orderController.returnOrder);
router.post('/orders/:id/reorder', orderController.reorder);

// Invoice route
router.get('/invoices/:orderId', orderController.getInvoice);

module.exports = router;