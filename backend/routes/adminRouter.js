const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  getDashboard,
  getUsers,
  loginAsUser,
  getOrders,
  updateOrderStatus,
  getStock,
  createStockMovement,
  getAnalytics,
  getStockMovementHistory,
  getStockAnalytics
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect, restrictTo('ROLE_ADMIN', 'ROLE_COMPTA'));

// Dashboard
router.get('/dashboard', getDashboard);

// User management
router.get('/users', getUsers);
router.post('/login-as/:userId', restrictTo('ROLE_ADMIN'), loginAsUser);

// Order management
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Stock management
router.get('/stock', restrictTo('ROLE_ADMIN', 'ROLE_STORE_KEEPER'), getStock);
router.post('/stock/movements', restrictTo('ROLE_ADMIN', 'ROLE_STORE_KEEPER'), createStockMovement);
router.get('/stock/movements/:productId', restrictTo('ROLE_ADMIN', 'ROLE_STORE_KEEPER'), getStockMovementHistory);

// Analytics
router.get('/analytics', getAnalytics);
router.get('/analytics/stock', restrictTo('ROLE_ADMIN', 'ROLE_STORE_KEEPER'), getStockAnalytics);

module.exports = router;