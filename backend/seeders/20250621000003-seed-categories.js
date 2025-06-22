'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create parent categories
    const categories = [
      {
        id: uuidv4(),
        name: 'Cuisson',
        slug: 'cuisson',
        description: 'Appareils de cuisson pour tous vos besoins',
        parentId: null,
        image: '/images/categories/cuisson.jpg',
        icon: 'cooking',
        isActive: true,
        isFeatured: true,
        displayOrder: 1,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Préparation',
        slug: 'preparation',
        description: 'Outils de préparation culinaire',
        parentId: null,
        image: '/images/categories/preparation.jpg',
        icon: 'prep',
        isActive: true,
        isFeatured: true,
        displayOrder: 2,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Café & Boissons',
        slug: 'cafe-boissons',
        description: 'Machines à café et préparation de boissons',
        parentId: null,
        image: '/images/categories/cafe.jpg',
        icon: 'coffee',
        isActive: true,
        isFeatured: true,
        displayOrder: 3,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Conservation',
        slug: 'conservation',
        description: 'Solutions de conservation alimentaire',
        parentId: null,
        image: '/images/categories/conservation.jpg',
        icon: 'storage',
        isActive: true,
        isFeatured: false,
        displayOrder: 4,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Ustensiles',
        slug: 'ustensiles',
        description: 'Ustensiles de cuisine professionnels',
        parentId: null,
        image: '/images/categories/ustensiles.jpg',
        icon: 'utensils',
        isActive: true,
        isFeatured: false,
        displayOrder: 5,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('categories', categories);

    // Get parent categories for subcategories
    const parentCategories = await queryInterface.sequelize.query(
      'SELECT id, slug FROM categories WHERE "parentId" IS NULL',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const categoryMap = {};
    parentCategories.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });

    // Create subcategories
    const subcategories = [
      // Cuisson subcategories
      {
        id: uuidv4(),
        name: 'Fours',
        slug: 'fours',
        description: 'Fours électriques et à gaz',
        parentId: categoryMap['cuisson'],
        isActive: true,
        isFeatured: false,
        displayOrder: 1,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Plaques de cuisson',
        slug: 'plaques-cuisson',
        description: 'Plaques à induction, vitrocéramique et gaz',
        parentId: categoryMap['cuisson'],
        isActive: true,
        isFeatured: false,
        displayOrder: 2,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Micro-ondes',
        slug: 'micro-ondes',
        description: 'Micro-ondes et fours combinés',
        parentId: categoryMap['cuisson'],
        isActive: true,
        isFeatured: false,
        displayOrder: 3,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Préparation subcategories
      {
        id: uuidv4(),
        name: 'Robots de cuisine',
        slug: 'robots-cuisine',
        description: 'Robots multifonctions et pétrins',
        parentId: categoryMap['preparation'],
        isActive: true,
        isFeatured: false,
        displayOrder: 1,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Mixeurs',
        slug: 'mixeurs',
        description: 'Mixeurs plongeants et blenders',
        parentId: categoryMap['preparation'],
        isActive: true,
        isFeatured: false,
        displayOrder: 2,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Café & Boissons subcategories
      {
        id: uuidv4(),
        name: 'Machines à expresso',
        slug: 'machines-expresso',
        description: 'Machines à expresso automatiques et manuelles',
        parentId: categoryMap['cafe-boissons'],
        isActive: true,
        isFeatured: false,
        displayOrder: 1,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Cafetières',
        slug: 'cafetieres',
        description: 'Cafetières filtres et italiennes',
        parentId: categoryMap['cafe-boissons'],
        isActive: true,
        isFeatured: false,
        displayOrder: 2,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('categories', subcategories);
    console.log('✓ Categories seeded successfully');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categories', null, {});
  }
};