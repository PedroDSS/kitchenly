const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateAlert } = require('../middleware/validators/alertValidator');

// User routes - all require authentication
router.use(protect);

// Get user's alerts
router.get('/', alertController.getAlerts);

// Get alert statistics for user
router.get('/statistics', alertController.getAlertStatistics);

// Create new alert
router.post('/', validateAlert, alertController.createAlert);

// Update alert
router.put('/:id', alertController.updateAlert);

// Delete alert
router.delete('/:id', alertController.deleteAlert);

// Admin routes
router.use(restrictTo('ROLE_ADMIN'));

// Get all alerts (admin)
router.get('/admin/all', alertController.getAllAlerts);

// Bulk disable alerts (admin)
router.post('/admin/bulk-disable', alertController.bulkDisableAlerts);

module.exports = router;