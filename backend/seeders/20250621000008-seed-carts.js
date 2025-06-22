'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get users for cart creation
    const userRecords = await queryInterface.sequelize.query(
      'SELECT id FROM users',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const carts = userRecords.map(user => ({
      id: uuidv4(),
      userId: user.id,
      sessionId: null,
      currency: 'EUR',
      subtotal: 0,
      discountAmount: 0,
      totalAmount: 0,
      promoCodeId: null,
      promoCodeDiscount: 0,
      notes: null,
      metadata: {},
      abandonedEmailSent: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      lastActivityAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await queryInterface.bulkInsert('carts', carts);
    console.log('✓ Carts seeded successfully');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('carts', null, {});
  }
};