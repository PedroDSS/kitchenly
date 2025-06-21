'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CartItem.belongsTo(models.Cart, { foreignKey: 'cartId', as: 'cart' });
      CartItem.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    }

    static addHooks(models) {
      CartItem.addHook('beforeCreate', async (cartItem) => {
        if (!cartItem.reservedUntil) {
          const reservationTime = new Date();
          reservationTime.setMinutes(reservationTime.getMinutes() + 15);
          cartItem.reservedUntil = reservationTime;
        }

        const product = await models.Product.findByPk(cartItem.productId);
        if (product && !product.canReserve(cartItem.quantity)) {
          throw new Error('Insufficient stock for reservation');
        }
      });

      CartItem.addHook('afterCreate', async (cartItem) => {
        const cart = await models.Cart.findByPk(cartItem.cartId);
        if (cart) {
          cart.lastActivityAt = new Date();
          await cart.save();
        }
      });

      CartItem.addHook('afterUpdate', async (cartItem) => {
        const cart = await models.Cart.findByPk(cartItem.cartId);
        if (cart) {
          cart.lastActivityAt = new Date();
          await cart.save();
        }
      });

      CartItem.addHook('afterDestroy', async (cartItem) => {
        const cart = await models.Cart.findByPk(cartItem.cartId);
        if (cart) {
          cart.lastActivityAt = new Date();
          await cart.save();
        }
      });
    }

    isExpired() {
      return this.reservedUntil && this.reservedUntil < new Date();
    }

    async extendReservation(minutes = 15) {
      const newReservation = new Date();
      newReservation.setMinutes(newReservation.getMinutes() + minutes);
      this.reservedUntil = newReservation;
      await this.save();
    }

    getTotalPrice() {
      return parseFloat(this.unitPrice) * this.quantity;
    }
  }

  CartItem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    cartId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'carts',
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
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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
      comment: 'Price at time of adding to cart'
    },
    reservedUntil: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '15-minute reservation period'
    },
    productOptions: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Selected product options/variants'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    totalPrice: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getTotalPrice();
      }
    }
  }, {
    sequelize,
    modelName: 'CartItem',
    tableName: 'cart_items',
    timestamps: true,
    indexes: [
      {
        fields: ['cartId']
      },
      {
        fields: ['productId']
      },
      {
        fields: ['reservedUntil']
      },
      {
        unique: true,
        fields: ['cartId', 'productId'],
        name: 'unique_cart_product'
      }
    ]
  });

  return CartItem;
};