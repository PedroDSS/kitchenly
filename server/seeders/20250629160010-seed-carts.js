import db from '../models/index.js';

export const up = async ({ context: queryInterface }) => {
  const { sequelize } = db;
  // Note: Cart items are temporary and have a 15-minute expiration
  // We'll create some recent cart items for testing
  const now = new Date();
  const carts = [
    // Active cart items (not expired)
    {
      productId: 4, // Samsung washing machine
      userId: 3, // John Doe
      quantity: 1,
      reservedUntil: new Date(now.getTime() + 10 * 60 * 1000), // 10 minutes from now
      addedAt: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      productId: 8, // Miele dishwasher
      userId: 4, // Jane Smith
      quantity: 1,
      reservedUntil: new Date(now.getTime() + 12 * 60 * 1000), // 12 minutes from now
      addedAt: new Date(now.getTime() - 3 * 60 * 1000), // 3 minutes ago
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      productId: 6, // Panasonic microwave
      userId: 5, // Alice Johnson
      quantity: 2,
      reservedUntil: new Date(now.getTime() + 14 * 60 * 1000), // 14 minutes from now
      addedAt: new Date(now.getTime() - 1 * 60 * 1000), // 1 minute ago
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Recently expired cart item (for testing cleanup)
    {
      productId: 10, // De'Longhi coffee machine
      userId: 3, // John Doe
      quantity: 1,
      reservedUntil: new Date(now.getTime() - 2 * 60 * 1000), // Expired 2 minutes ago
      addedAt: new Date(now.getTime() - 17 * 60 * 1000), // 17 minutes ago
      createdAt: new Date(now.getTime() - 17 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 17 * 60 * 1000)
    }
  ];

  await sequelize.getQueryInterface().bulkInsert('Carts', carts, {});
};

export const down = async ({ context: queryInterface }) => {
  const { sequelize } = db;
  await sequelize.getQueryInterface().bulkDelete('Carts', null, {});
};