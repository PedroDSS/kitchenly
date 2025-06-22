'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = [
      {
        id: uuidv4(),
        email: 'admin@kitchenly.com',
        password: await bcrypt.hash('Admin123!@#', 10),
        firstName: 'Admin',
        lastName: 'User',
        phone: '+33123456789',
        roles: ['ROLE_USER', 'ROLE_ADMIN'],
        customerType: 'B2C',
        isEmailConfirmed: true,
        isActive: true,
        acceptsMarketing: true,
        gdprConsentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        email: 'storekeeper@kitchenly.com',
        password: await bcrypt.hash('Store123!@#', 10),
        firstName: 'Store',
        lastName: 'Keeper',
        phone: '+33123456790',
        roles: ['ROLE_USER', 'ROLE_STORE_KEEPER'],
        customerType: 'B2C',
        isEmailConfirmed: true,
        isActive: true,
        acceptsMarketing: false,
        gdprConsentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        email: 'compta@kitchenly.com',
        password: await bcrypt.hash('Compta123!@#', 10),
        firstName: 'Comptable',
        lastName: 'User',
        phone: '+33123456791',
        roles: ['ROLE_USER', 'ROLE_COMPTA'],
        customerType: 'B2C',
        isEmailConfirmed: true,
        isActive: true,
        acceptsMarketing: false,
        gdprConsentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        email: 'b2b@entreprise.com',
        password: await bcrypt.hash('B2B123!@#', 10),
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '+33123456792',
        roles: ['ROLE_USER'],
        customerType: 'B2B',
        companyName: 'Restaurant Gourmet',
        siret: '12345678901234',
        vatNumber: 'FR12345678901',
        isEmailConfirmed: true,
        isActive: true,
        acceptsMarketing: true,
        gdprConsentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        email: 'user@example.com',
        password: await bcrypt.hash('User123!@#', 10),
        firstName: 'Marie',
        lastName: 'Martin',
        phone: '+33123456793',
        roles: ['ROLE_USER'],
        customerType: 'B2C',
        isEmailConfirmed: true,
        isActive: true,
        acceptsMarketing: true,
        gdprConsentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users);
    console.log('✓ Users seeded successfully');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};