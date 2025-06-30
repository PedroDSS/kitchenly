import Stocks from '../models/postgres/stockModel.js';

export const up = async ({ context: queryInterface }) => {
  const stocks = [
    // Initial stock for products
    {
      productId: 1,
      quantity: 15,
      operationType: 'ADD',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      productId: 2,
      quantity: 12,
      operationType: 'ADD',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      productId: 3,
      quantity: 20,
      operationType: 'ADD',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      productId: 4,
      quantity: 18,
      operationType: 'ADD',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      productId: 5,
      quantity: 10,
      operationType: 'ADD',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      productId: 6,
      quantity: 30,
      operationType: 'ADD',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      productId: 7,
      quantity: 25,
      operationType: 'ADD',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      productId: 8,
      quantity: 8,
      operationType: 'ADD',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      productId: 9,
      quantity: 6,
      operationType: 'ADD',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      productId: 10,
      quantity: 15,
      operationType: 'ADD',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Some stock movements to show history
    {
      productId: 1,
      quantity: 5,
      operationType: 'ADD',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      productId: 1,
      quantity: 2,
      operationType: 'REMOVE',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      productId: 3,
      quantity: 3,
      operationType: 'REMOVE',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      productId: 7,
      quantity: 10,
      operationType: 'ADD',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    {
      productId: 7,
      quantity: 5,
      operationType: 'REMOVE',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  ];

  await Stocks.bulkCreate(stocks, { 
    individualHooks: true
  });
};

export const down = async ({ context: queryInterface }) => {
  await Stocks.destroy({ where: {}, individualHooks: true });
};