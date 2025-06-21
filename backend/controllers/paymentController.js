const stripe = require('../services/stripe');
const { PaymentTransaction, Order, OrderItem, Product, Cart, CartItem } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sequelize } = require('../models');

// Create payment intent for an order
exports.createPaymentIntent = catchAsync(async (req, res, next) => {
  const { orderId } = req.body;
  const userId = req.user.id;

  if (!orderId) {
    return next(new AppError('Order ID is required', 400));
  }

  // Get order with items
  const order = await Order.findOne({
    where: { 
      id: orderId,
      userId,
      status: 'pending'
    },
    include: [{
      model: OrderItem,
      as: 'items',
      include: [{
        model: Product,
        as: 'product',
        attributes: ['name', 'price']
      }]
    }]
  });

  if (!order) {
    return next(new AppError('Order not found or not in pending status', 404));
  }

  // Check if payment intent already exists
  const existingTransaction = await PaymentTransaction.findOne({
    where: {
      orderId,
      provider: 'stripe',
      status: ['pending', 'processing']
    }
  });

  let paymentIntent;

  if (existingTransaction && existingTransaction.providerTransactionId) {
    // Retrieve existing payment intent
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(existingTransaction.providerTransactionId);
      
      // Update amount if order total changed
      if (paymentIntent.amount !== Math.round(order.totalAmount * 100)) {
        paymentIntent = await stripe.paymentIntents.update(existingTransaction.providerTransactionId, {
          amount: Math.round(order.totalAmount * 100)
        });
      }
    } catch (error) {
      // If retrieval fails, create new intent
      paymentIntent = null;
    }
  }

  if (!paymentIntent) {
    // Create new payment intent
    paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Amount in cents
      currency: 'eur',
      metadata: {
        orderId: order.id,
        userId: userId
      },
      automatic_payment_methods: {
        enabled: true,
      }
    });

    // Create or update payment transaction
    if (existingTransaction) {
      await existingTransaction.update({
        providerTransactionId: paymentIntent.id,
        amount: order.totalAmount,
        status: 'pending',
        metadata: {
          ...existingTransaction.metadata,
          paymentIntentId: paymentIntent.id
        }
      });
    } else {
      await PaymentTransaction.create({
        orderId: order.id,
        provider: 'stripe',
        providerTransactionId: paymentIntent.id,
        amount: order.totalAmount,
        currency: 'EUR',
        status: 'pending',
        metadata: {
          paymentIntentId: paymentIntent.id,
          userId: userId
        }
      });
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      orderId: order.id
    }
  });
});

// Handle Stripe webhook
exports.handleWebhook = catchAsync(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    return next(new AppError('Webhook secret not configured', 500));
  }

  let event;

  try {
    // req.body should be the raw body buffer when coming through the raw body parser
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return next(new AppError(`Webhook Error: ${err.message}`, 400));
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
    
    case 'charge.refunded':
      await handleRefundUpdate(event.data.object);
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
});

// Process refund
exports.refund = catchAsync(async (req, res, next) => {
  const { orderId, amount, reason } = req.body;
  const userId = req.user.id;

  if (!orderId) {
    return next(new AppError('Order ID is required', 400));
  }

  const transaction = await sequelize.transaction();

  try {
    // Get order
    const order = await Order.findOne({
      where: { 
        id: orderId,
        userId,
        status: ['delivered', 'processing', 'shipped']
      },
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return next(new AppError('Order not found or not eligible for refund', 404));
    }

    // Get payment transaction
    const paymentTransaction = await PaymentTransaction.findOne({
      where: {
        orderId,
        provider: 'stripe',
        status: 'completed'
      },
      transaction
    });

    if (!paymentTransaction) {
      await transaction.rollback();
      return next(new AppError('No completed payment found for this order', 404));
    }

    // Calculate refund amount
    const refundAmount = amount || paymentTransaction.amount;
    
    if (refundAmount > paymentTransaction.amount) {
      await transaction.rollback();
      return next(new AppError('Refund amount cannot exceed original payment', 400));
    }

    // Create Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentTransaction.providerTransactionId,
      amount: Math.round(refundAmount * 100), // Amount in cents
      reason: reason || 'requested_by_customer',
      metadata: {
        orderId: order.id,
        userId: userId
      }
    });

    // Update payment transaction
    await paymentTransaction.update({
      refundId: refund.id,
      refundAmount: refundAmount,
      refundStatus: 'pending',
      refundReason: reason,
      metadata: {
        ...paymentTransaction.metadata,
        refundId: refund.id,
        refundRequestedAt: new Date().toISOString()
      }
    }, { transaction });

    // Update order status if full refund
    if (refundAmount === paymentTransaction.amount) {
      await order.update({
        status: 'refunded'
      }, { transaction });
    }

    await transaction.commit();

    res.status(200).json({
      status: 'success',
      message: 'Refund initiated successfully',
      data: {
        refundId: refund.id,
        amount: refundAmount,
        status: refund.status,
        orderId: order.id
      }
    });

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

// Get payment status
exports.getPaymentStatus = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  // Verify order belongs to user
  const order = await Order.findOne({
    where: { 
      id: orderId,
      userId
    }
  });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Get payment transaction
  const paymentTransaction = await PaymentTransaction.findOne({
    where: {
      orderId,
      provider: 'stripe'
    },
    order: [['createdAt', 'DESC']]
  });

  if (!paymentTransaction) {
    return res.status(200).json({
      status: 'success',
      data: {
        paymentStatus: 'no_payment',
        orderId: order.id,
        orderStatus: order.status
      }
    });
  }

  // Get latest status from Stripe if payment is pending
  let currentStatus = paymentTransaction.status;
  
  if (paymentTransaction.providerTransactionId && 
      ['pending', 'processing'].includes(paymentTransaction.status)) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentTransaction.providerTransactionId
      );
      
      // Map Stripe status to our status
      currentStatus = mapStripeStatus(paymentIntent.status);
      
      // Update local status if different
      if (currentStatus !== paymentTransaction.status) {
        await paymentTransaction.update({ status: currentStatus });
      }
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      paymentStatus: currentStatus,
      amount: paymentTransaction.amount,
      currency: paymentTransaction.currency,
      provider: paymentTransaction.provider,
      refundStatus: paymentTransaction.refundStatus,
      refundAmount: paymentTransaction.refundAmount,
      orderId: order.id,
      orderStatus: order.status,
      createdAt: paymentTransaction.createdAt,
      updatedAt: paymentTransaction.updatedAt
    }
  });
});

// Helper functions
async function handlePaymentSuccess(paymentIntent) {
  const { orderId } = paymentIntent.metadata;
  
  const transaction = await sequelize.transaction();
  
  try {
    // Update payment transaction
    const paymentTransaction = await PaymentTransaction.findOne({
      where: {
        orderId,
        providerTransactionId: paymentIntent.id
      },
      transaction
    });

    if (paymentTransaction) {
      await paymentTransaction.update({
        status: 'completed',
        metadata: {
          ...paymentTransaction.metadata,
          completedAt: new Date().toISOString(),
          paymentMethod: paymentIntent.payment_method
        }
      }, { transaction });

      // Update order status
      const order = await Order.findByPk(orderId, { transaction });
      if (order && order.status === 'pending') {
        await order.update({
          status: 'processing',
          paymentStatus: 'paid'
        }, { transaction });

        // Clear user's cart after successful payment
        const cart = await Cart.findOne({
          where: { userId: order.userId },
          transaction
        });

        if (cart) {
          await CartItem.destroy({
            where: { cartId: cart.id },
            transaction
          });
        }
      }
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(paymentIntent) {
  const { orderId } = paymentIntent.metadata;
  
  try {
    const paymentTransaction = await PaymentTransaction.findOne({
      where: {
        orderId,
        providerTransactionId: paymentIntent.id
      }
    });

    if (paymentTransaction) {
      await paymentTransaction.update({
        status: 'failed',
        metadata: {
          ...paymentTransaction.metadata,
          failedAt: new Date().toISOString(),
          failureReason: paymentIntent.last_payment_error?.message
        }
      });
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleRefundUpdate(charge) {
  try {
    const paymentTransaction = await PaymentTransaction.findOne({
      where: {
        providerTransactionId: charge.payment_intent
      }
    });

    if (paymentTransaction && charge.refunded) {
      const refundStatus = charge.refunds.data[0]?.status === 'succeeded' 
        ? 'completed' 
        : 'failed';

      await paymentTransaction.update({
        refundStatus,
        refundAmount: charge.amount_refunded / 100, // Convert from cents
        metadata: {
          ...paymentTransaction.metadata,
          refundCompletedAt: new Date().toISOString()
        }
      });

      // Update order status if fully refunded
      if (refundStatus === 'completed' && charge.amount === charge.amount_refunded) {
        await Order.update(
          { status: 'refunded' },
          { where: { id: paymentTransaction.orderId } }
        );
      }
    }
  } catch (error) {
    console.error('Error handling refund update:', error);
  }
}

function mapStripeStatus(stripeStatus) {
  const statusMap = {
    'requires_payment_method': 'pending',
    'requires_confirmation': 'pending',
    'requires_action': 'processing',
    'processing': 'processing',
    'requires_capture': 'processing',
    'canceled': 'cancelled',
    'succeeded': 'completed'
  };
  
  return statusMap[stripeStatus] || 'failed';
}