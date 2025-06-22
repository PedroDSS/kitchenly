'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const deliveryOptions = [
      {
        id: uuidv4(),
        name: 'Livraison Standard',
        code: 'STANDARD',
        description: 'Livraison à domicile sous 3-5 jours ouvrés',
        type: 'standard',
        carrier: 'La Poste',
        price: 5.99,
        pricingType: 'fixed',
        pricingRules: {},
        estimatedDays: 4,
        cutoffTime: '15:00:00',
        maxWeight: 30,
        maxDimensions: JSON.stringify({ length: 150, width: 100, height: 100 }),
        availableCountries: ['FR', 'BE', 'LU'],
        excludedPostalCodes: [],
        trackingAvailable: true,
        signatureRequired: false,
        insuranceAvailable: true,
        insurancePrice: 2.99,
        isActive: true,
        displayOrder: 1,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Livraison Express',
        code: 'EXPRESS',
        description: 'Livraison à domicile sous 24-48h',
        type: 'express',
        carrier: 'Chronopost',
        price: 12.99,
        pricingType: 'fixed',
        pricingRules: {},
        estimatedDays: 1,
        cutoffTime: '12:00:00',
        maxWeight: 30,
        maxDimensions: JSON.stringify({ length: 150, width: 100, height: 100 }),
        availableCountries: ['FR'],
        excludedPostalCodes: [],
        trackingAvailable: true,
        signatureRequired: true,
        insuranceAvailable: true,
        insurancePrice: 3.99,
        isActive: true,
        displayOrder: 2,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Point Relais',
        code: 'RELAY_POINT',
        description: 'Livraison en point relais sous 2-4 jours',
        type: 'relay_point',
        carrier: 'Mondial Relay',
        price: 3.99,
        pricingType: 'fixed',
        pricingRules: {},
        estimatedDays: 3,
        cutoffTime: '17:00:00',
        maxWeight: 20,
        maxDimensions: JSON.stringify({ length: 80, width: 50, height: 50 }),
        availableCountries: ['FR', 'BE'],
        excludedPostalCodes: [],
        trackingAvailable: true,
        signatureRequired: false,
        insuranceAvailable: true,
        insurancePrice: 1.99,
        isActive: true,
        displayOrder: 3,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('delivery_options', deliveryOptions);
    console.log('✓ Delivery options seeded successfully');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('delivery_options', null, {});
  }
};