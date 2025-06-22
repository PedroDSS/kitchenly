const { Cart, CartItem, Product, Brand, Category } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { Op } = require('sequelize');
const { getAvailableStock } = require('../middleware/stockChecker');

const CART_EXPIRY_MINUTES = 15;

const getCartExpiryDate = () => {
  const now = new Date();
  return new Date(now.getTime() + CART_EXPIRY_MINUTES * 60 * 1000);
};

exports.addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user.id;

  if (!productId) {
    return next(new AppError('Product ID is required', 400));
  }

  if (quantity < 1) {
    return next(new AppError('Quantity must be at least 1', 400));
  }

  const product = await Product.findByPk(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  const availableStock = await getAvailableStock(productId);
  if (availableStock < quantity) {
    return next(new AppError(`Only ${availableStock} items available`, 400));
  }

  let cart = await Cart.findOne({
    where: {
      userId,
      expiresAt: { [Op.gt]: new Date() }
    }
  });

  if (!cart) {
    cart = await Cart.create({
      userId,
      expiresAt: getCartExpiryDate()
    });
  } else {
    await cart.update({ expiresAt: getCartExpiryDate() });
  }

  let cartItem = await CartItem.findOne({
    where: {
      cartId: cart.id,
      productId
    }
  });

  if (cartItem) {
    const newQuantity = cartItem.quantity + quantity;
    
    const currentReserved = cartItem.quantity;
    const additionalNeeded = quantity;
    const availableForAddition = await getAvailableStock(productId) + currentReserved;
    
    if (availableForAddition < newQuantity) {
      return next(new AppError(`Only ${availableForAddition - currentReserved} more items can be added`, 400));
    }

    await cartItem.update({
      quantity: newQuantity,
      reservedUntil: getCartExpiryDate()
    });
  } else {
    cartItem = await CartItem.create({
      cartId: cart.id,
      productId,
      quantity,
      reservedUntil: getCartExpiryDate()
    });
  }

  const updatedCart = await Cart.findByPk(cart.id, {
    include: [{
      model: CartItem,
      include: [{
        model: Product,
        include: [Brand, Category]
      }]
    }]
  });

  res.status(200).json({
    status: 'success',
    data: {
      cart: updatedCart
    }
  });
});

exports.getCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const cart = await Cart.findOne({
    where: {
      userId,
      expiresAt: { [Op.gt]: new Date() }
    },
    include: [{
      model: CartItem,
      where: {
        reservedUntil: { [Op.gt]: new Date() }
      },
      required: false,
      include: [{
        model: Product,
        include: [Brand, Category]
      }]
    }]
  });

  if (!cart) {
    return res.status(200).json({
      status: 'success',
      data: {
        cart: null,
        items: [],
        total: 0,
        itemCount: 0
      }
    });
  }

  const items = cart.CartItems || [];
  const total = items.reduce((sum, item) => {
    return sum + (item.Product.price * item.quantity);
  }, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const timeRemaining = Math.max(0, Math.floor((cart.expiresAt - new Date()) / 1000));

  res.status(200).json({
    status: 'success',
    data: {
      cart: {
        id: cart.id,
        expiresAt: cart.expiresAt,
        timeRemaining
      },
      items,
      total,
      itemCount
    }
  });
});

exports.updateCartItem = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const userId = req.user.id;

  if (quantity < 0) {
    return next(new AppError('Quantity cannot be negative', 400));
  }

  const cart = await Cart.findOne({
    where: {
      userId,
      expiresAt: { [Op.gt]: new Date() }
    }
  });

  if (!cart) {
    return next(new AppError('No active cart found', 404));
  }

  const cartItem = await CartItem.findOne({
    where: {
      id,
      cartId: cart.id
    },
    include: [Product]
  });

  if (!cartItem) {
    return next(new AppError('Cart item not found', 404));
  }

  if (quantity === 0) {
    await cartItem.destroy();
  } else {
    const currentReserved = cartItem.quantity;
    const availableStock = await getAvailableStock(cartItem.productId) + currentReserved;
    
    if (availableStock < quantity) {
      return next(new AppError(`Only ${availableStock} items available`, 400));
    }

    await cartItem.update({
      quantity,
      reservedUntil: getCartExpiryDate()
    });
  }

  await cart.update({ expiresAt: getCartExpiryDate() });

  const updatedCart = await Cart.findByPk(cart.id, {
    include: [{
      model: CartItem,
      include: [{
        model: Product,
        include: [Brand, Category]
      }]
    }]
  });

  res.status(200).json({
    status: 'success',
    data: {
      cart: updatedCart
    }
  });
});

exports.removeFromCart = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const cart = await Cart.findOne({
    where: {
      userId,
      expiresAt: { [Op.gt]: new Date() }
    }
  });

  if (!cart) {
    return next(new AppError('No active cart found', 404));
  }

  const cartItem = await CartItem.findOne({
    where: {
      id,
      cartId: cart.id
    }
  });

  if (!cartItem) {
    return next(new AppError('Cart item not found', 404));
  }

  await cartItem.destroy();

  const remainingItems = await CartItem.count({
    where: { cartId: cart.id }
  });

  if (remainingItems === 0) {
    await cart.destroy();
    return res.status(200).json({
      status: 'success',
      data: {
        cart: null,
        items: [],
        total: 0,
        itemCount: 0
      }
    });
  }

  await cart.update({ expiresAt: getCartExpiryDate() });

  const updatedCart = await Cart.findByPk(cart.id, {
    include: [{
      model: CartItem,
      include: [{
        model: Product,
        include: [Brand, Category]
      }]
    }]
  });

  res.status(200).json({
    status: 'success',
    data: {
      cart: updatedCart
    }
  });
});

exports.clearCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const cart = await Cart.findOne({
    where: {
      userId,
      expiresAt: { [Op.gt]: new Date() }
    }
  });

  if (cart) {
    await CartItem.destroy({
      where: { cartId: cart.id }
    });
    await cart.destroy();
  }

  res.status(200).json({
    status: 'success',
    message: 'Cart cleared successfully'
  });
});