'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const brands = [
      {
        id: uuidv4(),
        name: 'KitchenAid',
        slug: 'kitchenaid',
        description: 'Professional-grade kitchen appliances for passionate home cooks',
        logo: '/images/brands/kitchenaid-logo.png',
        website: 'https://www.kitchenaid.com',
        country: 'US',
        isActive: true,
        isFeatured: true,
        displayOrder: 1,
        metadata: JSON.stringify({ established: 1919, specialty: 'Stand Mixers' }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Smeg',
        slug: 'smeg',
        description: 'Italian home appliances that combine technology with style',
        logo: '/images/brands/smeg-logo.png',
        website: 'https://www.smeg.com',
        country: 'IT',
        isActive: true,
        isFeatured: true,
        displayOrder: 2,
        metadata: JSON.stringify({ established: 1948, specialty: 'Retro Design' }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Le Creuset',
        slug: 'le-creuset',
        description: 'Premium French cookware since 1925',
        logo: '/images/brands/le-creuset-logo.png',
        website: 'https://www.lecreuset.com',
        country: 'FR',
        isActive: true,
        isFeatured: true,
        displayOrder: 3,
        metadata: JSON.stringify({ established: 1925, specialty: 'Cast Iron Cookware' }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Breville',
        slug: 'breville',
        description: 'Australian kitchen appliances for the culinary creative',
        logo: '/images/brands/breville-logo.png',
        website: 'https://www.breville.com',
        country: 'AU',
        isActive: true,
        isFeatured: false,
        displayOrder: 4,
        metadata: JSON.stringify({ established: 1932, specialty: 'Espresso Machines' }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Cuisinart',
        slug: 'cuisinart',
        description: 'American home appliance brand',
        logo: '/images/brands/cuisinart-logo.png',
        website: 'https://www.cuisinart.com',
        country: 'US',
        isActive: true,
        isFeatured: false,
        displayOrder: 5,
        metadata: JSON.stringify({ established: 1971, specialty: 'Food Processors' }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('brands', brands);
    console.log('✓ Brands seeded successfully');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('brands', null, {});
  }
};