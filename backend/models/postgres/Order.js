'use strict';
const {
  Model,
  Op
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'items' });
      Order.hasOne(models.PaymentTransaction, { foreignKey: 'orderId', as: 'payment' });
      Order.hasOne(models.Invoice, { foreignKey: 'orderId', as: 'invoice' });
      Order.belongsTo(models.PromoCode, { foreignKey: 'promoCodeId', as: 'promoCode' });
    }

    static addHooks(models) {
      Order.addHook('beforeCreate', (order) => {
        if (!order.orderNumber) {
          const timestamp = Date.now().toString();
          const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          order.orderNumber = `ORD-${timestamp}-${random}`;
        }
      });

      Order.addHook('afterUpdate', async (order, { fields }) => {
        if (fields.includes('status') && order.status === 'completed') {
          const items = await order.getItems({ include: ['product'] });
          for (const item of items) {
            if (item.product) {
              await item.product.increment('salesCount', { by: item.quantity });
            }
          }
        }
      });
    }

    async calculateTotal() {
      const items = await this.getItems();
      const subtotal = items.reduce((total, item) => {
        return total + (parseFloat(item.unitPrice) * item.quantity);
      }, 0);

      let discount = 0;
      if (this.promoCodeId && this.promoCode) {
        if (this.promoCode.type === 'percentage') {
          discount = subtotal * (this.promoCode.discount / 100);
        } else {
          discount = this.promoCode.discount;
        }
      }

      const total = subtotal - discount + parseFloat(this.deliveryFee || 0);
      this.subtotal = subtotal;
      this.discountAmount = discount;
      this.totalAmount = total;
      
      await this.save();
      return total;
    }

    canBeCancelled() {
      return ['pending', 'processing'].includes(this.status);
    }

    canBeReturned() {
      if (this.status !== 'delivered') return false;
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return this.deliveredAt && this.deliveredAt > thirtyDaysAgo;
    }
  }

  Order.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    orderNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'),
      defaultValue: 'pending'
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded', 'partial_refund'),
      defaultValue: 'pending'
    },
    paymentMethod: {
      type: DataTypes.ENUM('stripe', 'paypal'),
      allowNull: false
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    deliveryFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'EUR'
    },
    billingAddress: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        hasRequiredFields(value) {
          const required = ['firstName', 'lastName', 'address', 'city', 'postalCode', 'country'];
          for (const field of required) {
            if (!value[field]) {
              throw new Error(`Billing address must include ${field}`);
            }
          }
        }
      }
    },
    shippingAddress: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        hasRequiredFields(value) {
          const required = ['firstName', 'lastName', 'address', 'city', 'postalCode', 'country'];
          for (const field of required) {
            if (!value[field]) {
              throw new Error(`Shipping address must include ${field}`);
            }
          }
        }
      }
    },
    deliveryMethod: {
      type: DataTypes.ENUM('standard', 'express', 'relay_point'),
      allowNull: false
    },
    deliveryOptionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'delivery_options',
        key: 'id'
      }
    },
    relayPointId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'relay_points',
        key: 'id'
      }
    },
    trackingNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    promoCodeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'promo_codes',
        key: 'id'
      }
    },
    paidAt: DataTypes.DATE,
    shippedAt: DataTypes.DATE,
    deliveredAt: DataTypes.DATE,
    cancelledAt: DataTypes.DATE,
    returnedAt: DataTypes.DATE,
    refundedAt: DataTypes.DATE,
    estimatedDeliveryDate: DataTypes.DATE,
    cancelReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    returnReason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    paranoid: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['orderNumber']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['paymentStatus']
      },
      {
        fields: ['createdAt']
      },
      {
        fields: ['deliveryMethod']
      }
    ]
  });

  // Static methods
  Order.generateOrderNumber = async function() {
    const prefix = 'ORD';
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Find the last order number for this month
    const lastOrder = await this.findOne({
      where: {
        orderNumber: {
          [Op.like]: `${prefix}-${year}${month}%`
        }
      },
      order: [['orderNumber', 'DESC']]
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `${prefix}-${year}${month}-${String(sequence).padStart(4, '0')}`;
  };

  // Instance methods
  Order.prototype.canBeCancelled = function() {
    return ['pending', 'processing'].includes(this.status) && 
           this.paymentStatus !== 'refunded';
  };

  Order.prototype.canBeReturned = function() {
    if (this.status !== 'delivered') return false;
    
    // Check if within return period (30 days)
    const deliveredDate = this.deliveredAt || this.updatedAt;
    const daysSinceDelivery = Math.floor((new Date() - deliveredDate) / (1000 * 60 * 60 * 24));
    
    return daysSinceDelivery <= 30;
  };

  Order.prototype.calculateTotal = function() {
    return this.subtotal - this.discount + this.deliveryFee;
  };

  Order.prototype.generateInvoice = async function() {
    const Invoice = sequelize.models.Invoice;
    
    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({
      where: { orderId: this.id }
    });

    if (existingInvoice) {
      return existingInvoice;
    }

    // Generate invoice number
    const invoiceNumber = `INV-${this.orderNumber}`;
    
    // TODO: Implement PDF generation logic here
    // For now, we'll create the invoice record with a placeholder path
    const invoice = await Invoice.create({
      orderId: this.id,
      number: invoiceNumber,
      path: `/invoices/${invoiceNumber}.pdf`,
      amount: this.totalAmount
    });

    return invoice;
  };

  return Order;
};