'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const relayPoints = [
      {
        id: uuidv4(),
        externalId: 'LP-75001-001',
        name: 'La Poste Paris Louvre',
        type: 'post_office',
        carrier: 'La Poste',
        address: JSON.stringify({
          street: '52 Rue du Louvre',
          city: 'Paris',
          postalCode: '75001',
          country: 'FR'
        }),
        coordinates: Sequelize.fn('ST_GeomFromText', 'POINT(2.3417 48.8627)'),
        phoneNumber: '+33142332000',
        email: 'louvre@laposte.fr',
        openingHours: JSON.stringify({
          monday: { open: '09:00', close: '19:00' },
          tuesday: { open: '09:00', close: '19:00' },
          wednesday: { open: '09:00', close: '19:00' },
          thursday: { open: '09:00', close: '19:00' },
          friday: { open: '09:00', close: '19:00' },
          saturday: { open: '09:00', close: '13:00' },
          sunday: { closed: true }
        }),
        closureDates: [],
        services: ['colissimo', 'chronopost', 'registered_mail'],
        parkingAvailable: false,
        wheelchairAccessible: true,
        maxParcelWeight: 30,
        maxParcelSize: JSON.stringify({ length: 100, width: 60, height: 60 }),
        capacity: 200,
        currentLoad: 45,
        isActive: true,
        lastSyncAt: new Date(),
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        externalId: 'MR-75011-023',
        name: 'Mondial Relay - Franprix République',
        type: 'partner_shop',
        carrier: 'Mondial Relay',
        address: JSON.stringify({
          street: '12 Place de la République',
          city: 'Paris',
          postalCode: '75011',
          country: 'FR'
        }),
        coordinates: Sequelize.fn('ST_GeomFromText', 'POINT(2.3672 48.8675)'),
        phoneNumber: '+33148058923',
        openingHours: JSON.stringify({
          monday: { open: '08:00', close: '21:00' },
          tuesday: { open: '08:00', close: '21:00' },
          wednesday: { open: '08:00', close: '21:00' },
          thursday: { open: '08:00', close: '21:00' },
          friday: { open: '08:00', close: '21:00' },
          saturday: { open: '08:00', close: '21:00' },
          sunday: { open: '09:00', close: '20:00' }
        }),
        closureDates: [],
        services: ['pickup', 'dropoff'],
        parkingAvailable: false,
        wheelchairAccessible: true,
        maxParcelWeight: 20,
        maxParcelSize: JSON.stringify({ length: 80, width: 50, height: 50 }),
        capacity: 100,
        currentLoad: 23,
        isActive: true,
        lastSyncAt: new Date(),
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('relay_points', relayPoints);
    console.log('✓ Relay points seeded successfully');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('relay_points', null, {});
  }
};