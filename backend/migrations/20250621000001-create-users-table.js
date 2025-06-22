'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      dateOfBirth: {
        type: Sequelize.DATE,
        allowNull: true
      },
      roles: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: ['ROLE_USER'],
        allowNull: false
      },
      customerType: {
        type: Sequelize.STRING,
        defaultValue: 'B2C',
        allowNull: false
      },
      companyName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      siret: {
        type: Sequelize.STRING,
        allowNull: true
      },
      vatNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isEmailConfirmed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      confirmationToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      confirmationTokenExpiry: {
        type: Sequelize.DATE,
        allowNull: true
      },
      resetPasswordToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      resetPasswordExpiry: {
        type: Sequelize.DATE,
        allowNull: true
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      failedLoginAttempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      lockoutUntil: {
        type: Sequelize.DATE,
        allowNull: true
      },
      passwordChangedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      preferences: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      acceptsMarketing: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      gdprConsentDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      dataRetentionDate: {
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
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['confirmationToken']);
    await queryInterface.addIndex('users', ['resetPasswordToken']);
    await queryInterface.addIndex('users', ['isActive']);
    await queryInterface.addIndex('users', ['customerType']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};