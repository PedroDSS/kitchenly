'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('invoices', {
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
      number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'draft',
        allowNull: false
      },
      issueDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      dueDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      path: {
        type: Sequelize.STRING,
        allowNull: true
      },
      sentAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      paidAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'EUR',
        allowNull: false
      },
      billingInfo: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      companyInfo: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      items: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      discountAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      taxRate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      taxAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      deliveryFee: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      termsAndConditions: {
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
    await queryInterface.addIndex('invoices', ['number']);
    await queryInterface.addIndex('invoices', ['orderId']);
    await queryInterface.addIndex('invoices', ['status']);
    await queryInterface.addIndex('invoices', ['issueDate']);
    await queryInterface.addIndex('invoices', ['dueDate']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('invoices');
  }
};