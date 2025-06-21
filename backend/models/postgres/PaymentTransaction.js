'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PaymentTransaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PaymentTransaction.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
    }

    static addHooks(models) {
      PaymentTransaction.addHook('afterCreate', async (transaction) => {
        if (transaction.status === 'succeeded') {
          const order = await models.Order.findByPk(transaction.orderId);
          if (order) {
            order.paymentStatus = 'paid';
            order.paidAt = new Date();
            await order.save();
          }
        }
      });

      PaymentTransaction.addHook('afterUpdate', async (transaction, { fields }) => {
        if (fields.includes('status')) {
          const order = await models.Order.findByPk(transaction.orderId);
          if (order) {
            switch (transaction.status) {
              case 'succeeded':
                order.paymentStatus = 'paid';
                order.paidAt = new Date();
                break;
              case 'failed':
                order.paymentStatus = 'failed';
                break;
              case 'refunded':
                order.paymentStatus = 'refunded';
                order.refundedAt = new Date();
                break;
              case 'partial_refund':
                order.paymentStatus = 'partial_refund';
                break;
            }
            await order.save();
          }
        }
      });
    }

    isRefundable() {
      return this.status === 'succeeded' && !this.refundId;
    }

    canPartialRefund() {
      return this.status === 'succeeded' && this.refundedAmount < this.amount;
    }
  }

  PaymentTransaction.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    transactionId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      comment: 'External payment provider transaction ID'
    },
    provider: {
      type: DataTypes.ENUM('stripe', 'paypal'),
      allowNull: false
    },
    method: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Payment method type (card, bank_transfer, etc.)'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Amount must be greater than or equal to 0'
        }
      }
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'EUR'
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded', 'partial_refund'),
      defaultValue: 'pending'
    },
    refundId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'External refund ID if refunded'
    },
    refundedAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Additional payment metadata from provider'
    },
    errorCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lastWebhookEvent: {
      type: DataTypes.STRING,
      allowNull: true
    },
    processedAt: DataTypes.DATE,
    failedAt: DataTypes.DATE,
    refundedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'PaymentTransaction',
    tableName: 'payment_transactions',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['transactionId']
      },
      {
        fields: ['orderId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['provider']
      }
    ]
  });

  return PaymentTransaction;
};