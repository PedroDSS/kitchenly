'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Cart.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Cart.hasMany(models.CartItem, { foreignKey: 'cartId', as: 'items' });
    }

    static addHooks(models) {
      Cart.addHook('beforeCreate', (cart) => {
        if (!cart.expiresAt) {
          const expirationTime = new Date();
          expirationTime.setMinutes(expirationTime.getMinutes() + 15);
          cart.expiresAt = expirationTime;
        }
      });
    }

    isExpired() {
      return this.expiresAt && this.expiresAt < new Date();
    }

    async calculateTotal() {
      const items = await this.getItems({ include: ['product'] });
      const total = items.reduce((sum, item) => {
        if (item.product && !item.isExpired()) {
          return sum + (parseFloat(item.product.price) * item.quantity);
        }
        return sum;
      }, 0);
      
      this.totalAmount = total;
      await this.save();
      return total;
    }

    async clearExpiredItems() {
      const items = await this.getItems();
      const expiredItems = items.filter(item => item.isExpired());
      
      for (const item of expiredItems) {
        await item.destroy();
      }
      
      return expiredItems.length;
    }

    async extendExpiration(minutes = 15) {
      const newExpiration = new Date();
      newExpiration.setMinutes(newExpiration.getMinutes() + minutes);
      this.expiresAt = newExpiration;
      
      const items = await this.getItems();
      for (const item of items) {
        item.reservedUntil = newExpiration;
        await item.save();
      }
      
      await this.save();
    }

    async clear() {
      await sequelize.models.CartItem.destroy({
        where: { cartId: this.id }
      });
      
      this.totalAmount = 0;
      await this.save();
    }
  }

  Cart.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'For guest carts before user registration'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'EUR'
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    lastActivityAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    promoCodeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'promo_codes',
        key: 'id'
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Cart',
    tableName: 'carts',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId']
      },
      {
        fields: ['sessionId']
      },
      {
        fields: ['expiresAt']
      }
    ]
  });

  return Cart;
};