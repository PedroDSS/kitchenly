const { Order, OrderItem, Cart, CartItem, Product, User, PromoCode, DeliveryOption, PaymentTransaction, sequelize } = require('../models/postgres');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { Op } = require('sequelize');
const { getAvailableStock } = require('../middleware/stockChecker');
const EmailService = require('../services/email');
const stripe = require('../services/stripe');

exports.createOrder = catchAsync(async (req, res, next) => {
  const { 
    deliveryOptionId, 
    deliveryAddress, 
    billingAddress,
    promoCode,
    paymentMethodId,
    saveAddresses = false 
  } = req.body;
  const userId = req.user.id;

  // Start a transaction
  const t = await sequelize.transaction();

  try {
    // Get user's active cart
    const cart = await Cart.findOne({
      where: {
        userId,
        expiresAt: { [Op.gt]: new Date() }
      },
      include: [{
        model: CartItem,
        include: [{
          model: Product,
          include: ['brand', 'category']
        }]
      }],
      transaction: t
    });

    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
      await t.rollback();
      return next(new AppError('Your cart is empty', 400));
    }

    // Validate delivery option
    const deliveryOption = await DeliveryOption.findByPk(deliveryOptionId, { transaction: t });
    if (!deliveryOption) {
      await t.rollback();
      return next(new AppError('Invalid delivery option', 400));
    }
    
    // Map delivery option type to delivery method
    const deliveryMethodMap = {
      'standard': 'standard',
      'express': 'express',
      'relay_point': 'relay_point'
    };
    const deliveryMethod = deliveryMethodMap[deliveryOption.type] || 'standard';

    // Validate promo code if provided
    let discount = 0;
    let promoCodeRecord = null;
    if (promoCode) {
      promoCodeRecord = await PromoCode.findOne({
        where: {
          code: promoCode,
          active: true,
          expiresAt: { [Op.gt]: new Date() },
          [Op.or]: [
            { usageLimit: null },
            { usageLimit: { [Op.gt]: sequelize.col('usageCount') } }
          ]
        },
        transaction: t
      });

      if (!promoCodeRecord) {
        await t.rollback();
        return next(new AppError('Invalid or expired promo code', 400));
      }
    }

    // Calculate order total
    let subtotal = 0;
    const orderItems = [];

    // Validate stock and prepare order items
    for (const cartItem of cart.cartItems) {
      const availableStock = await getAvailableStock(cartItem.productId, t);
      if (availableStock < cartItem.quantity) {
        await t.rollback();
        return next(new AppError(`Product "${cartItem.product.name}" has only ${availableStock} items available`, 400));
      }

      const itemTotal = cartItem.product.price * cartItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        unitPrice: cartItem.product.price,
        productName: cartItem.product.name,
        productSku: cartItem.product.sku,
        productImage: cartItem.product.images?.[0] || null
      });
    }

    // Apply promo code discount
    if (promoCodeRecord) {
      if (promoCodeRecord.type === 'percentage') {
        discount = (subtotal * promoCodeRecord.discount) / 100;
      } else {
        discount = promoCodeRecord.discount;
      }
      discount = Math.min(discount, subtotal); // Ensure discount doesn't exceed subtotal
    }

    const deliveryFee = deliveryOption.price || 0;
    const totalAmount = subtotal - discount + deliveryFee;

    // Create order
    const order = await Order.create({
      userId,
      orderNumber: await Order.generateOrderNumber(),
      status: 'pending',
      subtotal,
      discountAmount: discount,
      deliveryFee,
      totalAmount,
      paymentMethod: 'stripe', // Will be updated after payment
      shippingAddress: deliveryAddress,
      billingAddress: billingAddress || deliveryAddress,
      deliveryMethod,
      deliveryOptionId,
      promoCodeId: promoCodeRecord?.id,
      notes: req.body.notes
    }, { transaction: t });

    // Create order items
    for (const item of orderItems) {
      await OrderItem.create({
        orderId: order.id,
        ...item
      }, { transaction: t });
    }

    // Update promo code usage
    if (promoCodeRecord) {
      await promoCodeRecord.increment('usageCount', { transaction: t });
    }

    // Don't update stock yet - will be updated after successful payment
    // Stock is already reserved through CartItem.reservedUntil

    // Don't clear the cart yet - will be cleared after successful payment
    // Update cart expiry to give user time to complete payment
    await cart.update({
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes for payment
    }, { transaction: t });

    // Save addresses to user profile if requested
    if (saveAddresses) {
      const user = await User.findByPk(userId, { transaction: t });
      await user.update({
        defaultDeliveryAddress: deliveryAddress,
        defaultBillingAddress: billingAddress || deliveryAddress
      }, { transaction: t });
    }

    // Commit transaction
    await t.commit();

    // Fetch complete order with associations
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          include: ['product']
        },
        'deliveryOption',
        'promoCode'
      ]
    });

    // Send order confirmation email
    try {
      await EmailService.sendOrderConfirmation(req.user.email, completeOrder);
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
    }

    res.status(201).json({
      status: 'success',
      data: {
        order: completeOrder
      }
    });
  } catch (error) {
    await t.rollback();
    throw error;
  }
});

exports.getMyOrders = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

  const where = { userId };
  if (status) {
    where.status = status;
  }

  const offset = (page - 1) * limit;

  const { count, rows: orders } = await Order.findAndCountAll({
    where,
    include: [
      {
        model: OrderItem,
        include: ['product']
      },
      'deliveryOption'
    ],
    order: [[sortBy, sortOrder]],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    }
  });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const order = await Order.findOne({
    where: { 
      id,
      userId // Ensure user can only access their own orders
    },
    include: [
      {
        model: OrderItem,
        include: [{
          model: Product,
          include: ['brand', 'category']
        }]
      },
      'deliveryOption',
      'promoCode',
      {
        model: PaymentTransaction,
        attributes: ['id', 'amount', 'status', 'createdAt']
      }
    ]
  });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { reason } = req.body;

  const order = await Order.findOne({
    where: { id, userId },
    include: ['orderItems', 'paymentTransactions']
  });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (!order.canBeCancelled()) {
    return next(new AppError('This order cannot be cancelled', 400));
  }

  const t = await sequelize.transaction();

  try {
    // Update order status
    await order.update({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelReason: reason
    }, { transaction: t });

    // Restore product stock
    for (const item of order.orderItems) {
      await Product.increment('stock', {
        by: item.quantity,
        where: { id: item.productId },
        transaction: t
      });
    }

    // Process refund if payment was made
    if (order.paymentStatus === 'completed' && order.paymentTransactions.length > 0) {
      const paymentTransaction = order.paymentTransactions.find(pt => pt.status === 'succeeded');
      if (paymentTransaction && paymentTransaction.stripePaymentIntentId) {
        try {
          const refund = await stripe.refunds.create({
            payment_intent: paymentTransaction.stripePaymentIntentId,
            reason: 'requested_by_customer'
          });

          await PaymentTransaction.create({
            orderId: order.id,
            type: 'refund',
            amount: refund.amount / 100,
            status: refund.status,
            stripeRefundId: refund.id,
            metadata: { reason }
          }, { transaction: t });

          await order.update({
            paymentStatus: 'refunded'
          }, { transaction: t });
        } catch (stripeError) {
          console.error('Stripe refund error:', stripeError);
          // Don't rollback the cancellation if refund fails
          // Admin can process refund manually
        }
      }
    }

    await t.commit();

    // Send cancellation email
    try {
      await EmailService.sendOrderCancellation(req.user.email, order);
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }

    res.status(200).json({
      status: 'success',
      message: 'Order cancelled successfully',
      data: {
        order
      }
    });
  } catch (error) {
    await t.rollback();
    throw error;
  }
});

exports.returnOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { reason, items } = req.body; // items is optional for partial returns

  const order = await Order.findOne({
    where: { id, userId },
    include: ['orderItems']
  });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (!order.canBeReturned()) {
    return next(new AppError('This order cannot be returned', 400));
  }

  if (!reason) {
    return next(new AppError('Return reason is required', 400));
  }

  const t = await sequelize.transaction();

  try {
    // If specific items are provided, validate them
    let returnItems = order.orderItems;
    let partialReturn = false;

    if (items && Array.isArray(items) && items.length > 0) {
      partialReturn = true;
      returnItems = order.orderItems.filter(item => 
        items.some(ri => ri.orderItemId === item.id)
      );

      if (returnItems.length !== items.length) {
        await t.rollback();
        return next(new AppError('Invalid return items', 400));
      }
    }

    // Update order status
    await order.update({
      status: partialReturn ? 'partially_returned' : 'returned',
      returnedAt: new Date(),
      returnReason: reason
    }, { transaction: t });

    // Mark items as returned
    for (const item of returnItems) {
      const returnQuantity = partialReturn 
        ? items.find(ri => ri.orderItemId === item.id)?.quantity || item.quantity
        : item.quantity;

      await item.update({
        returnedQuantity: returnQuantity,
        returnedAt: new Date()
      }, { transaction: t });
    }

    await t.commit();

    // Send return confirmation email
    try {
      await EmailService.sendReturnConfirmation(req.user.email, order, returnItems);
    } catch (emailError) {
      console.error('Failed to send return confirmation email:', emailError);
    }

    res.status(200).json({
      status: 'success',
      message: 'Return request submitted successfully',
      data: {
        order,
        returnedItems: returnItems
      }
    });
  } catch (error) {
    await t.rollback();
    throw error;
  }
});

exports.confirmPayment = catchAsync(async (req, res, next) => {
  const { orderId, paymentIntentId } = req.body;
  
  const t = await sequelize.transaction();
  
  try {
    // Get order with items
    const order = await Order.findOne({
      where: { 
        id: orderId,
        status: 'pending'
      },
      include: [{
        model: OrderItem,
        include: ['product']
      }, 'user'],
      transaction: t
    });

    if (!order) {
      await t.rollback();
      return next(new AppError('Order not found or not in pending status', 404));
    }

    // Update order status
    await order.update({
      status: 'processing',
      paymentStatus: 'paid',
      paidAt: new Date()
    }, { transaction: t });

    // Update product stock
    for (const orderItem of order.orderItems) {
      await orderItem.product.decrement('stock', { 
        by: orderItem.quantity,
        transaction: t 
      });
    }

    // Clear user's cart
    const cart = await Cart.findOne({
      where: { userId: order.userId },
      transaction: t
    });

    if (cart) {
      await CartItem.destroy({
        where: { cartId: cart.id },
        transaction: t
      });
      await cart.destroy({ transaction: t });
    }

    await t.commit();

    // Send order confirmation email
    try {
      await EmailService.sendOrderConfirmation(order.user.email, order);
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
    }

    res.status(200).json({
      status: 'success',
      message: 'Payment confirmed and order processing',
      data: {
        order
      }
    });
  } catch (error) {
    await t.rollback();
    throw error;
  }
});

exports.reorder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const originalOrder = await Order.findOne({
    where: { id, userId },
    include: [{
      model: OrderItem,
      include: ['product']
    }]
  });

  if (!originalOrder) {
    return next(new AppError('Order not found', 404));
  }

  const t = await sequelize.transaction();

  try {
    // Get or create cart
    let cart = await Cart.findOne({
      where: {
        userId,
        expiresAt: { [Op.gt]: new Date() }
      },
      transaction: t
    });

    if (!cart) {
      cart = await Cart.create({
        userId,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      }, { transaction: t });
    }

    // Clear existing cart items
    await CartItem.destroy({
      where: { cartId: cart.id },
      transaction: t
    });

    // Add items from original order to cart
    const unavailableItems = [];
    const addedItems = [];

    for (const orderItem of originalOrder.orderItems) {
      const product = orderItem.product;
      
      if (!product || !product.isAvailable) {
        unavailableItems.push({
          name: orderItem.productName,
          reason: 'Product no longer available'
        });
        continue;
      }

      const availableStock = await getAvailableStock(product.id, t);
      const quantityToAdd = Math.min(orderItem.quantity, availableStock);

      if (quantityToAdd === 0) {
        unavailableItems.push({
          name: product.name,
          reason: 'Out of stock'
        });
        continue;
      }

      const cartItem = await CartItem.create({
        cartId: cart.id,
        productId: product.id,
        quantity: quantityToAdd,
        reservedUntil: new Date(Date.now() + 15 * 60 * 1000)
      }, { transaction: t });

      addedItems.push({
        productId: product.id,
        name: product.name,
        quantity: quantityToAdd,
        requestedQuantity: orderItem.quantity
      });

      if (quantityToAdd < orderItem.quantity) {
        unavailableItems.push({
          name: product.name,
          reason: `Only ${quantityToAdd} available (requested ${orderItem.quantity})`
        });
      }
    }

    await t.commit();

    // Fetch updated cart
    const updatedCart = await Cart.findByPk(cart.id, {
      include: [{
        model: CartItem,
        include: [{
          model: Product,
          include: ['brand', 'category']
        }]
      }]
    });

    res.status(200).json({
      status: 'success',
      message: 'Items added to cart',
      data: {
        cart: updatedCart,
        addedItems,
        unavailableItems
      }
    });
  } catch (error) {
    await t.rollback();
    throw error;
  }
});

exports.getInvoice = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  const order = await Order.findOne({
    where: { 
      id: orderId,
      userId,
      status: { [Op.notIn]: ['pending', 'cancelled'] }
    },
    include: [
      {
        model: OrderItem,
        include: ['product']
      },
      'user',
      'deliveryOption',
      'invoice'
    ]
  });

  if (!order) {
    return next(new AppError('Order not found or invoice not available', 404));
  }

  // If invoice doesn't exist, generate it
  if (!order.invoice) {
    try {
      const invoice = await order.generateInvoice();
      order.invoice = invoice;
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      return next(new AppError('Failed to generate invoice', 500));
    }
  }

  // Send invoice file
  res.download(order.invoice.path, `invoice-${order.orderNumber}.pdf`);
});