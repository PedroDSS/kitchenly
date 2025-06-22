const { Product, CartItem } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.checkProductStock = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return next();
  }

  const product = await Product.findByPk(productId);
  
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  const reservedQuantity = await CartItem.sum('quantity', {
    where: {
      productId,
      reservedUntil: { [Op.gt]: new Date() }
    }
  }) || 0;

  const availableStock = product.stock - reservedQuantity;

  if (availableStock < quantity) {
    return next(new AppError(`Only ${availableStock} items available in stock`, 400));
  }

  req.availableStock = availableStock;
  next();
});

exports.getAvailableStock = async (productId) => {
  const product = await Product.findByPk(productId);
  
  if (!product) {
    return 0;
  }

  const reservedQuantity = await CartItem.sum('quantity', {
    where: {
      productId,
      reservedUntil: { [Op.gt]: new Date() }
    }
  }) || 0;

  return Math.max(0, product.stock - reservedQuantity);
};

exports.checkCartItemsStock = catchAsync(async (req, res, next) => {
  if (!req.cart || !req.cart.CartItems || req.cart.CartItems.length === 0) {
    return next();
  }

  const stockErrors = [];

  for (const item of req.cart.CartItems) {
    const availableStock = await exports.getAvailableStock(item.productId);
    
    if (availableStock < item.quantity) {
      stockErrors.push({
        productId: item.productId,
        productName: item.Product.name,
        requested: item.quantity,
        available: availableStock
      });
    }
  }

  if (stockErrors.length > 0) {
    return next(new AppError('Some items in your cart have insufficient stock', 400, {
      stockErrors
    }));
  }

  next();
});