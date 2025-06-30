import db from '../models/index.js';

export const up = async ({ context: queryInterface }) => {
  const { sequelize } = db;
  const paymentProducts = [
    // Payment 1 - Samsung Refrigerator
    {
      paymentId: 1,
      productId: 1,
      quantity: 1,
      amount: 2899.99,
      refundId: null,
      refundAmount: null,
      refundStatus: null,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    },
    
    // Payment 2 - Bosch Washing Machine + Siemens Oven
    {
      paymentId: 2,
      productId: 3,
      quantity: 1,
      amount: 899.99,
      refundId: null,
      refundAmount: null,
      refundStatus: null,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    {
      paymentId: 2,
      productId: 5,
      quantity: 1,
      amount: 899.99,
      refundId: null,
      refundAmount: null,
      refundStatus: null,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    
    // Payment 3 - Dyson Vacuum
    {
      paymentId: 3,
      productId: 7,
      quantity: 1,
      amount: 699.99,
      refundId: null,
      refundAmount: null,
      refundStatus: null,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    
    // Payment 4 - Panasonic Microwave (pending)
    {
      paymentId: 4,
      productId: 6,
      quantity: 1,
      amount: 189.99,
      refundId: null,
      refundAmount: null,
      refundStatus: null,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    
    // Payment 5 - De'Longhi Coffee Machine (refunded)
    {
      paymentId: 5,
      productId: 10,
      quantity: 1,
      amount: 999.99,
      refundId: 're_1234567890refund',
      refundAmount: 999.99,
      refundStatus: 'succeeded',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    
    // Payment 6 - LG Refrigerator + Daikin AC
    {
      paymentId: 6,
      productId: 2,
      quantity: 1,
      amount: 1999.99,
      refundId: null,
      refundAmount: null,
      refundStatus: null,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      paymentId: 6,
      productId: 9,
      quantity: 1,
      amount: 1899.99,
      refundId: null,
      refundAmount: null,
      refundStatus: null,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];

  await sequelize.getQueryInterface().bulkInsert('PaymentProducts', paymentProducts, {});
};

export const down = async ({ context: queryInterface }) => {
  const { sequelize } = db;
  await sequelize.getQueryInterface().bulkDelete('PaymentProducts', null, {});
};