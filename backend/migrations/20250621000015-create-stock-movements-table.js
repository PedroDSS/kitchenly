'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('stock_movements', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      reference: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      previousStock: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      newStock: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      supplier: {
        type: Sequelize.STRING,
        allowNull: true
      },
      batchNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      expiryDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
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
    await queryInterface.addIndex('stock_movements', ['productId']);
    await queryInterface.addIndex('stock_movements', ['userId']);
    await queryInterface.addIndex('stock_movements', ['orderId']);
    await queryInterface.addIndex('stock_movements', ['type']);
    await queryInterface.addIndex('stock_movements', ['createdAt']);
    await queryInterface.addIndex('stock_movements', ['batchNumber']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('stock_movements');
  }
};