'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EmailAlert extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      EmailAlert.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      EmailAlert.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
      EmailAlert.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    }

    static addHooks(models) {
      EmailAlert.addHook('beforeCreate', (alert) => {
        // Ensure either categoryId or productId is set, but not both
        if (!alert.categoryId && !alert.productId) {
          throw new Error('Either categoryId or productId must be specified');
        }
        if (alert.categoryId && alert.productId) {
          throw new Error('Cannot specify both categoryId and productId');
        }
      });
    }

    shouldTrigger(event, data) {
      if (!this.enabled) return false;
      
      switch (this.type) {
        case 'price_drop':
          return event === 'price_changed' && data.newPrice < data.oldPrice;
        
        case 'back_in_stock':
          return event === 'stock_changed' && data.oldStock === 0 && data.newStock > 0;
        
        case 'new_product':
          return event === 'product_created' && 
                 (this.categoryId === data.categoryId || 
                  (this.category && data.categoryPath.includes(this.categoryId)));
        
        case 'low_stock':
          return event === 'stock_changed' && 
                 data.newStock > 0 && 
                 data.newStock <= (this.threshold || 5);
        
        default:
          return false;
      }
    }
  }

  EmailAlert.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [['price_drop', 'back_in_stock', 'new_product', 'low_stock']],
          msg: 'Type must be price_drop, back_in_stock, new_product, or low_stock'
        }
      }
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    frequency: {
      type: DataTypes.STRING,
      defaultValue: 'immediate',
      validate: {
        isIn: {
          args: [['immediate', 'daily', 'weekly']],
          msg: 'Frequency must be immediate, daily, or weekly'
        }
      }
    },
    threshold: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Threshold value for certain alert types (e.g., low stock threshold)'
    },
    lastSentAt: DataTypes.DATE,
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Additional alert configuration'
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Alert expiration date'
    }
  }, {
    sequelize,
    modelName: 'EmailAlert',
    tableName: 'email_alerts',
    timestamps: true,
    defaultScope: {
      where: {
        enabled: true
      }
    },
    scopes: {
      active: {
        where: {
          enabled: true,
          [sequelize.Sequelize.Op.or]: [
            { expiresAt: null },
            { expiresAt: { [sequelize.Sequelize.Op.gt]: new Date() } }
          ]
        }
      }
    },
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['type']
      },
      {
        fields: ['categoryId']
      },
      {
        fields: ['productId']
      },
      {
        fields: ['enabled']
      },
      {
        unique: true,
        fields: ['userId', 'type', 'categoryId', 'productId'],
        name: 'unique_user_alert'
      }
    ]
  });

  return EmailAlert;
};