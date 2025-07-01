import db from '../models/index.js';

export const up = async ({ context: queryInterface }) => {
  const { sequelize } = db;
  const payments = [
    {
      userId: 3, // John Doe
      amount: 2899.99,
      paymentIntentId: 'pi_1234567890abcdef',
      refundId: null,
      status: 'succeeded',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      userId: 4, // Jane Smith
      amount: 1799.99,
      paymentIntentId: 'pi_2345678901bcdefg',
      refundId: null,
      status: 'succeeded',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    {
      userId: 3, // John Doe
      amount: 699.99,
      paymentIntentId: 'pi_3456789012cdefgh',
      refundId: null,
      status: 'succeeded',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      userId: 5, // Alice Johnson
      amount: 189.99,
      paymentIntentId: 'pi_4567890123defghi',
      refundId: null,
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      userId: 4, // Jane Smith
      amount: 999.99,
      paymentIntentId: 'pi_5678901234efghij',
      refundId: 're_1234567890refund',
      status: 'refunded',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // Refunded 5 days ago
    },
    {
      userId: 3, // John Doe
      amount: 3899.98, // Multiple products
      paymentIntentId: 'pi_6789012345fghijk',
      refundId: null,
      status: 'succeeded',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];

  await sequelize.getQueryInterface().bulkInsert('Payments', payments, {});
};

export const down = async ({ context: queryInterface }) => {
  const { sequelize } = db;
  await sequelize.getQueryInterface().bulkDelete('Payments', null, {});
};