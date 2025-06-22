'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('email_alerts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      categoryId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      frequency: {
        type: Sequelize.STRING,
        defaultValue: 'immediate',
        allowNull: false
      },
      threshold: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      lastPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      lastStock: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      lastCheckedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      lastSentAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      sendCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      expiresAt: {
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
    await queryInterface.addIndex('email_alerts', ['userId']);
    await queryInterface.addIndex('email_alerts', ['type']);
    await queryInterface.addIndex('email_alerts', ['categoryId']);
    await queryInterface.addIndex('email_alerts', ['productId']);
    await queryInterface.addIndex('email_alerts', ['enabled']);
    await queryInterface.addIndex('email_alerts', ['userId', 'type', 'categoryId', 'productId'], {
      unique: true,
      name: 'email_alerts_unique_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('email_alerts');
  }
};