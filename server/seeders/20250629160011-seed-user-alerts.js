import db from '../models/index.js';

export const up = async ({ context: queryInterface }) => {
  const { sequelize } = db;
  const userAlerts = [
    // John Doe's alerts
    {
      userId: 3,
      alertId: 1, // price_drop
      productId: 1, // Samsung refrigerator
      category: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: 3,
      alertId: 2, // back_in_stock
      productId: 11, // Whirlpool oven (inactive product)
      category: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: 3,
      alertId: 3, // new_product
      productId: null,
      category: 'Aspirateur',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Jane Smith's alerts
    {
      userId: 4,
      alertId: 1, // price_drop
      productId: null,
      category: 'Lave-linge',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: 4,
      alertId: 4, // category_sale
      productId: null,
      category: 'Four',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: 4,
      alertId: 2, // back_in_stock
      productId: 10, // De'Longhi coffee machine
      category: null,
      isActive: false, // Deactivated alert
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Alice Johnson's alerts
    {
      userId: 5,
      alertId: 3, // new_product
      productId: null,
      category: 'Cafetière',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: 5,
      alertId: 1, // price_drop
      productId: 7, // Dyson vacuum
      category: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    
    // Admin user alert
    {
      userId: 2,
      alertId: 4, // category_sale
      productId: null,
      category: 'Réfrigérateur',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await sequelize.getQueryInterface().bulkInsert('UserAlerts', userAlerts, {});
};

export const down = async ({ context: queryInterface }) => {
  const { sequelize } = db;
  await sequelize.getQueryInterface().bulkDelete('UserAlerts', null, {});
};