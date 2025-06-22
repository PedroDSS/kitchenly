const express = require('express');
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(cartController.getCart)
  .delete(cartController.clearCart);

router.post('/add', cartController.addToCart);

router
  .route('/items/:id')
  .put(cartController.updateCartItem)
  .delete(cartController.removeFromCart);

module.exports = router;