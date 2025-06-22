'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('products', {
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
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      sku: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      barcode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      shortDescription: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      compareAtPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      costPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      stock: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      lowStockThreshold: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
        allowNull: false
      },
      trackInventory: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      allowBackorder: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      categoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      brandId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'brands',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      weight: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true
      },
      dimensions: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      mainImage: {
        type: Sequelize.STRING,
        allowNull: true
      },
      images: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
        allowNull: false
      },
      features: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      specifications: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
        allowNull: false
      },
      warranty: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      isFeatured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      isNew: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      viewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      salesCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      rating: {
        type: Sequelize.DECIMAL(2, 1),
        defaultValue: 0,
        allowNull: false
      },
      reviewCount: {
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
    await queryInterface.addIndex('products', ['slug']);
    await queryInterface.addIndex('products', ['sku']);
    await queryInterface.addIndex('products', ['categoryId']);
    await queryInterface.addIndex('products', ['brandId']);
    await queryInterface.addIndex('products', ['isActive']);
    await queryInterface.addIndex('products', ['isFeatured']);
    await queryInterface.addIndex('products', ['price']);
    await queryInterface.addIndex('products', ['stock']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('products');
  }
};