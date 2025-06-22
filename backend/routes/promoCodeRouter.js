const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  getPromoCodes,
  getPromoCode,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  validatePromoCode,
  getPromoCodeAnalytics
} = require('../controllers/promoCodeController');

// Public route - validate promo code
router.post('/validate', validatePromoCode);

// Protected routes - require authentication
router.use(protect);

// Admin only routes
router.use(restrictTo('ROLE_ADMIN', 'ROLE_COMPTA'));

router
  .route('/')
  .get(getPromoCodes)
  .post(createPromoCode);

router
  .route('/:id')
  .get(getPromoCode)
  .put(updatePromoCode)
  .delete(deletePromoCode);

router.get('/:id/analytics', getPromoCodeAnalytics);

module.exports = router;