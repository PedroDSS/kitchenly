'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('promo_codes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
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
      discount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      minimumAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      maxUses: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      maxUsesPerUser: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      usageCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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
        onDelete: 'SET NULL'
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      userRestrictions: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        defaultValue: [],
        allowNull: false
      },
      excludedProductIds: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        defaultValue: [],
        allowNull: false
      },
      excludedCategoryIds: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        defaultValue: [],
        allowNull: false
      },
      validFrom: {
        type: Sequelize.DATE,
        allowNull: false
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.addIndex('promo_codes', ['code']);
    await queryInterface.addIndex('promo_codes', ['type']);
    await queryInterface.addIndex('promo_codes', ['categoryId']);
    await queryInterface.addIndex('promo_codes', ['productId']);
    await queryInterface.addIndex('promo_codes', ['isActive']);
    await queryInterface.addIndex('promo_codes', ['validFrom']);
    await queryInterface.addIndex('promo_codes', ['expiresAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('promo_codes');
  }
};