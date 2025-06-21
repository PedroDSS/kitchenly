'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      OrderItem.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
      OrderItem.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    }

    static addHooks(models) {
      OrderItem.addHook('afterCreate', async (orderItem) => {
        const product = await models.Product.findByPk(orderItem.productId);
        if (product) {
          await product.decrementStock(orderItem.quantity);
        }
      });

      OrderItem.addHook('afterDestroy', async (orderItem) => {
        const order = await models.Order.findByPk(orderItem.orderId);
        if (order && ['cancelled', 'returned'].includes(order.status)) {
          const product = await models.Product.findByPk(orderItem.productId);
          if (product) {
            await product.incrementStock(orderItem.quantity);
          }
        }
      });
    }

    getTotalPrice() {
      return parseFloat(this.unitPrice) * this.quantity;
    }
  }

  OrderItem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Snapshot of product name at time of order'
    },
    productSku: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Snapshot of product SKU at time of order'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Quantity must be at least 1'
        }
      }
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Unit price must be greater than or equal to 0'
        }
      }
    },
    totalPrice: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getTotalPrice();
      }
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    productImage: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Snapshot of product image at time of order'
    },
    productOptions: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Any product options/variants selected'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    returnedQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    returnedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
    timestamps: true,
    indexes: [
      {
        fields: ['orderId']
      },
      {
        fields: ['productId']
      }
    ]
  });

  return OrderItem;
};