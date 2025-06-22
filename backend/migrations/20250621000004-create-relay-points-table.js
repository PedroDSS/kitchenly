'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('relay_points', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      externalId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      carrier: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      coordinates: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      openingHours: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      closureDates: {
        type: Sequelize.ARRAY(Sequelize.DATE),
        defaultValue: [],
        allowNull: false
      },
      services: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
        allowNull: false
      },
      parkingAvailable: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      wheelchairAccessible: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      maxParcelWeight: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      maxParcelSize: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      currentLoad: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      lastSyncAt: {
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
    await queryInterface.addIndex('relay_points', ['externalId']);
    await queryInterface.addIndex('relay_points', ['carrier']);
    await queryInterface.addIndex('relay_points', ['type']);
    await queryInterface.addIndex('relay_points', ['isActive']);
    await queryInterface.addIndex('relay_points', ['coordinates']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('relay_points');
  }
};