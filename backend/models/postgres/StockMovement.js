'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StockMovement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      StockMovement.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
      StockMovement.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      StockMovement.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
    }

    static addHooks(models) {
      StockMovement.addHook('afterCreate', async (movement) => {
        const product = await models.Product.findByPk(movement.productId);
        if (product) {
          const newStock = product.stock + movement.quantity;
          product.stock = Math.max(0, newStock);
          await product.save();
          
          movement.newStock = product.stock;
          await movement.save({ hooks: false });
        }
      });
    }

    isPositive() {
      return this.quantity > 0;
    }

    isNegative() {
      return this.quantity < 0;
    }
  }

  StockMovement.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notZero(value) {
          if (value === 0) {
            throw new Error('Quantity cannot be zero');
          }
        }
      }
    },
    type: {
      type: DataTypes.ENUM(
        'purchase',      // Stock purchase/receipt
        'sale',          // Customer sale
        'return',        // Customer return
        'adjustment',    // Manual adjustment
        'damage',        // Damaged goods
        'loss',          // Lost/stolen
        'transfer',      // Transfer between locations
        'production'     // Manufacturing/assembly
      ),
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Reason for stock movement is required'
        }
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who performed the stock movement'
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'orders',
        key: 'id'
      },
      comment: 'Related order if applicable'
    },
    previousStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    newStock: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Cost per unit for this movement'
    },
    supplier: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Supplier name for purchase movements'
    },
    batchNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Batch or lot number'
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Expiry date for perishable items'
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Warehouse or storage location'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Additional movement data'
    }
  }, {
    sequelize,
    modelName: 'StockMovement',
    tableName: 'stock_movements',
    timestamps: true,
    indexes: [
      {
        fields: ['productId']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['orderId']
      },
      {
        fields: ['type']
      },
      {
        fields: ['createdAt']
      },
      {
        fields: ['batchNumber']
      }
    ]
  });

  return StockMovement;
};