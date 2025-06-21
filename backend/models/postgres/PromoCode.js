'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PromoCode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PromoCode.hasMany(models.Order, { foreignKey: 'promoCodeId', as: 'orders' });
      PromoCode.hasMany(models.Cart, { foreignKey: 'promoCodeId', as: 'carts' });
      PromoCode.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
      PromoCode.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    }

    static addHooks(models) {
      PromoCode.addHook('beforeCreate', (promoCode) => {
        // Ensure code is uppercase
        if (promoCode.code) {
          promoCode.code = promoCode.code.toUpperCase();
        }
      });

      PromoCode.addHook('beforeUpdate', (promoCode, { fields }) => {
        if (fields.includes('code')) {
          promoCode.code = promoCode.code.toUpperCase();
        }
      });
    }

    isValid() {
      if (!this.isActive) return false;
      
      const now = new Date();
      
      if (this.validFrom && this.validFrom > now) return false;
      if (this.expiresAt && this.expiresAt < now) return false;
      if (this.maxUses && this.usageCount >= this.maxUses) return false;
      
      return true;
    }

    canBeUsedBy(userId) {
      if (!this.isValid()) return false;
      
      if (this.userRestrictions && this.userRestrictions.length > 0) {
        return this.userRestrictions.includes(userId);
      }
      
      return true;
    }

    async canBeAppliedTo(items) {
      if (!this.isValid()) return false;
      
      // Check minimum order amount
      const orderTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      if (this.minimumAmount && orderTotal < this.minimumAmount) {
        return false;
      }
      
      // Check category restrictions
      if (this.categoryId) {
        const hasValidItem = items.some(item => item.categoryId === this.categoryId);
        if (!hasValidItem) return false;
      }
      
      // Check product restrictions
      if (this.productId) {
        const hasValidItem = items.some(item => item.id === this.productId);
        if (!hasValidItem) return false;
      }
      
      return true;
    }

    calculateDiscount(subtotal) {
      if (this.type === 'percentage') {
        return subtotal * (this.discount / 100);
      } else {
        return Math.min(this.discount, subtotal);
      }
    }
  }

  PromoCode.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Promo code is required'
        },
        len: {
          args: [3, 20],
          msg: 'Promo code must be between 3 and 20 characters'
        }
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('percentage', 'fixed_amount'),
      allowNull: false
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Discount must be greater than 0'
        },
        validatePercentage(value) {
          if (this.type === 'percentage' && value > 100) {
            throw new Error('Percentage discount cannot exceed 100%');
          }
        }
      }
    },
    minimumAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Minimum order amount required'
    },
    maxUses: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Maximum total uses allowed'
    },
    maxUsesPerUser: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Maximum uses per user'
    },
    usageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      },
      comment: 'Restrict to specific category'
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id'
      },
      comment: 'Restrict to specific product'
    },
    userRestrictions: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: [],
      comment: 'Restrict to specific users'
    },
    validFrom: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Additional promo code configuration'
    }
  }, {
    sequelize,
    modelName: 'PromoCode',
    tableName: 'promo_codes',
    timestamps: true,
    defaultScope: {
      where: {
        isActive: true
      }
    },
    scopes: {
      valid: {
        where: {
          isActive: true,
          [sequelize.Sequelize.Op.or]: [
            { validFrom: { [sequelize.Sequelize.Op.lte]: new Date() } },
            { validFrom: null }
          ],
          [sequelize.Sequelize.Op.or]: [
            { expiresAt: { [sequelize.Sequelize.Op.gte]: new Date() } },
            { expiresAt: null }
          ]
        }
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['code']
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
        fields: ['isActive']
      },
      {
        fields: ['validFrom']
      },
      {
        fields: ['expiresAt']
      }
    ]
  });

  return PromoCode;
};