'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Invoice.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
    }

    static addHooks(models) {
      Invoice.addHook('beforeCreate', async (invoice) => {
        if (!invoice.number) {
          // Generate invoice number
          const year = new Date().getFullYear();
          const lastInvoice = await Invoice.findOne({
            where: sequelize.where(
              sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM "createdAt"')),
              year
            ),
            order: [['createdAt', 'DESC']]
          });
          
          let sequence = 1;
          if (lastInvoice && lastInvoice.number) {
            const match = lastInvoice.number.match(/INV-(\d{4})-(\d+)/);
            if (match && parseInt(match[1]) === year) {
              sequence = parseInt(match[2]) + 1;
            }
          }
          
          invoice.number = `INV-${year}-${sequence.toString().padStart(6, '0')}`;
        }
      });
    }

    getFileName() {
      return `${this.number.replace(/\//g, '-')}.pdf`;
    }

    isOverdue() {
      if (this.status === 'paid' || !this.dueDate) return false;
      return new Date() > this.dueDate;
    }

    getDaysOverdue() {
      if (!this.isOverdue()) return 0;
      
      const now = new Date();
      const diffTime = Math.abs(now - this.dueDate);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }

  Invoice.init({
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
    number: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'draft',
      validate: {
        isIn: {
          args: [['draft', 'sent', 'paid', 'overdue', 'cancelled']],
          msg: 'Status must be draft, sent, paid, overdue, or cancelled'
        }
      }
    },
    issueDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Payment due date for B2B customers'
    },
    path: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'File path to generated PDF'
    },
    sentAt: DataTypes.DATE,
    paidAt: DataTypes.DATE,
    billingInfo: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: 'Snapshot of billing information at invoice creation'
    },
    companyInfo: {
      type: DataTypes.JSONB,
      defaultValue: {
        name: 'Kitchenly',
        address: {
          street: '123 Commerce Street',
          city: 'Paris',
          postalCode: '75001',
          country: 'France'
        },
        vatNumber: 'FR12345678901',
        siret: '12345678900001',
        email: 'contact.kitchenly@gmail.com',
        phone: '+33 1 23 45 67 89'
      }
    },
    items: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: 'Snapshot of order items at invoice creation'
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    taxRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 20.0,
      comment: 'VAT rate in percentage'
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    shippingAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'EUR'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    termsAndConditions: {
      type: DataTypes.TEXT,
      defaultValue: 'Payment is due within 30 days of invoice date. Late payments may incur interest charges.'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    sequelize,
    modelName: 'Invoice',
    tableName: 'invoices',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['number']
      },
      {
        fields: ['orderId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['issueDate']
      },
      {
        fields: ['dueDate']
      }
    ]
  });

  return Invoice;
};