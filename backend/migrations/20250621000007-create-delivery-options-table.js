'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('delivery_options', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      carrier: {
        type: Sequelize.STRING,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      pricingType: {
        type: Sequelize.STRING,
        defaultValue: 'fixed',
        allowNull: false
      },
      pricingRules: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      estimatedDays: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      cutoffTime: {
        type: Sequelize.TIME,
        allowNull: true
      },
      maxWeight: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      maxDimensions: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      availableCountries: {
        type: Sequelize.ARRAY(Sequelize.STRING(2)),
        defaultValue: ['FR'],
        allowNull: false
      },
      excludedPostalCodes: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
        allowNull: false
      },
      relayPointId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'relay_points',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      trackingAvailable: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      signatureRequired: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      insuranceAvailable: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      insurancePrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      displayOrder: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
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
    await queryInterface.addIndex('delivery_options', ['code']);
    await queryInterface.addIndex('delivery_options', ['type']);
    await queryInterface.addIndex('delivery_options', ['carrier']);
    await queryInterface.addIndex('delivery_options', ['isActive']);
    await queryInterface.addIndex('delivery_options', ['relayPointId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('delivery_options');
  }
};