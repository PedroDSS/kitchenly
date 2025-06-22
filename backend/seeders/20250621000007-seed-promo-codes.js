'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get category ID for cafe-boissons
    const cafeCategory = await queryInterface.sequelize.query(
      'SELECT id FROM categories WHERE slug = \'cafe-boissons\'',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const promoCodes = [
      {
        id: uuidv4(),
        code: 'WELCOME10',
        description: 'Réduction de bienvenue pour les nouveaux clients',
        type: 'percentage',
        discount: 10,
        minimumAmount: 50,
        maxUses: null,
        maxUsesPerUser: 1,
        usageCount: 0,
        categoryId: null,
        productId: null,
        userRestrictions: [],
        excludedProductIds: [],
        excludedCategoryIds: [],
        validFrom: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        code: 'CAFE20',
        description: '20% de réduction sur les machines à café',
        type: 'percentage',
        discount: 20,
        minimumAmount: 100,
        maxUses: 100,
        maxUsesPerUser: 1,
        usageCount: 0,
        categoryId: cafeCategory.length > 0 ? cafeCategory[0].id : null,
        productId: null,
        userRestrictions: [],
        excludedProductIds: [],
        excludedCategoryIds: [],
        validFrom: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        code: 'LOYAL50',
        description: '50€ de réduction pour nos clients fidèles',
        type: 'fixed_amount',
        discount: 50,
        minimumAmount: 300,
        maxUses: 50,
        maxUsesPerUser: 1,
        usageCount: 0,
        categoryId: null,
        productId: null,
        userRestrictions: [],
        excludedProductIds: [],
        excludedCategoryIds: [],
        validFrom: new Date(),
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('promo_codes', promoCodes);
    console.log('✓ Promo codes seeded successfully');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('promo_codes', null, {});
  }
};