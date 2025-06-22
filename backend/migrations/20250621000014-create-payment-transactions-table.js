'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payment_transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      transactionId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      provider: {
        type: Sequelize.STRING,
        allowNull: false
      },
      method: {
        type: Sequelize.STRING,
        allowNull: true
      },
      type: {
        type: Sequelize.STRING,
        defaultValue: 'payment',
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      refundedAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'EUR',
        allowNull: false
      },
      refundId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      refundReason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      failureCode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      failureMessage: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      rawResponse: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      processedAt: {
        type: Sequelize.DATE,
        allowNull: true
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
    await queryInterface.addIndex('payment_transactions', ['transactionId']);
    await queryInterface.addIndex('payment_transactions', ['orderId']);
    await queryInterface.addIndex('payment_transactions', ['status']);
    await queryInterface.addIndex('payment_transactions', ['provider']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('payment_transactions');
  }
};