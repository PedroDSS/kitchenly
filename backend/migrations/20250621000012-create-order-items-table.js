'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('order_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      productName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      productSku: {
        type: Sequelize.STRING,
        allowNull: false
      },
      productImage: {
        type: Sequelize.STRING,
        allowNull: true
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      unitPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      discount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      tax: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      productOptions: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      refundedQuantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      refundedAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      returnReason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      returnedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
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
    await queryInterface.addIndex('order_items', ['orderId']);
    await queryInterface.addIndex('order_items', ['productId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('order_items');
  }
};