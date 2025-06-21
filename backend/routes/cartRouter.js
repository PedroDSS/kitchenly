const express = require('express');
const cartController = require('../controllers/cartController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

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