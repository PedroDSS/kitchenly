'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      orderNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'pending',
        allowNull: false
      },
      paymentStatus: {
        type: Sequelize.STRING,
        defaultValue: 'pending',
        allowNull: false
      },
      paymentMethod: {
        type: Sequelize.STRING,
        allowNull: true
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'EUR',
        allowNull: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      discountAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      promoCodeId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'promo_codes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      promoCodeDiscount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      taxRate: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 20,
        allowNull: false
      },
      taxAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      deliveryFee: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      insuranceFee: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      refundedAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      billingAddress: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      shippingAddress: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      deliveryMethod: {
        type: Sequelize.STRING,
        allowNull: false
      },
      deliveryOptionId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'delivery_options',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      relayPointId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'relay_points',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      trackingNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      trackingUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      estimatedDeliveryDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      customerNotes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      adminNotes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      giftMessage: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isGift: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      requiresSignature: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      paidAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      shippedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      deliveredAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      cancelledAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      returnedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      refundedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create indexes
    await queryInterface.addIndex('orders', ['orderNumber']);
    await queryInterface.addIndex('orders', ['userId']);
    await queryInterface.addIndex('orders', ['status']);
    await queryInterface.addIndex('orders', ['paymentStatus']);
    await queryInterface.addIndex('orders', ['createdAt']);
    await queryInterface.addIndex('orders', ['deliveryMethod']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('orders');
  }
};