import db from '../models/index.js';

export const up = async ({ context: queryInterface }) => {
  const { sequelize } = db;
  const promoCodes = [
    // General promo codes
    {
      code: 'WELCOME10',
      discount: 10,
      expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      product_id: null,
      category: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      code: 'SUMMER20',
      discount: 20,
      expiry_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      product_id: null,
      category: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      code: 'VIP30',
      discount: 30,
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      product_id: null,
      category: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Category-specific promo codes
    {
      code: 'FRIDGE15',
      discount: 15,
      expiry_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      product_id: null,
      category: 'Réfrigérateur',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      code: 'WASH25',
      discount: 25,
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      product_id: null,
      category: 'Lave-linge',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      code: 'COFFEE20',
      discount: 20,
      expiry_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      product_id: null,
      category: 'Cafetière',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Product-specific promo codes
    {
      code: 'SAMSUNG50',
      discount: 50,
      expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      product_id: 1, // Samsung refrigerator
      category: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      code: 'DYSON40',
      discount: 40,
      expiry_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      product_id: 7, // Dyson vacuum
      category: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Expired promo code for testing
    {
      code: 'EXPIRED10',
      discount: 10,
      expiry_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      product_id: null,
      category: null,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  ];

  await sequelize.getQueryInterface().bulkInsert('PromoCodes', promoCodes, {});
};

export const down = async ({ context: queryInterface }) => {
  const { sequelize } = db;
  await sequelize.getQueryInterface().bulkDelete('PromoCodes', null, {});
};