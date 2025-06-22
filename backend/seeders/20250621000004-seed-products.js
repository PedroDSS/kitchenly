'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get categories and brands for products
    const allCategories = await queryInterface.sequelize.query(
      'SELECT id, slug FROM categories',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const categoryMap = {};
    allCategories.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });

    const allBrands = await queryInterface.sequelize.query(
      'SELECT id, slug FROM brands',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const brandMap = {};
    allBrands.forEach(brand => {
      brandMap[brand.slug] = brand.id;
    });

    const products = [
      {
        id: uuidv4(),
        name: 'KitchenAid Artisan 5KSM125',
        slug: 'kitchenaid-artisan-5ksm125',
        sku: 'KA-5KSM125-RED',
        barcode: '5413184120146',
        description: 'Le robot pâtissier KitchenAid Artisan est l\'allié parfait pour toutes vos préparations culinaires. Avec son moteur puissant de 300W et sa capacité de 4,8L, il vous accompagne dans toutes vos recettes.',
        shortDescription: 'Robot pâtissier iconique avec bol de 4,8L',
        price: 599.99,
        compareAtPrice: 699.99,
        costPrice: 350.00,
        stock: 25,
        lowStockThreshold: 5,
        trackInventory: true,
        allowBackorder: true,
        categoryId: categoryMap['robots-cuisine'],
        brandId: brandMap['kitchenaid'],
        weight: 10.5,
        dimensions: { length: 36, width: 24, height: 37 },
        mainImage: '/images/products/kitchenaid-artisan-red.jpg',
        images: [
          '/images/products/kitchenaid-artisan-red.jpg',
          '/images/products/kitchenaid-artisan-red-2.jpg',
          '/images/products/kitchenaid-artisan-red-3.jpg'
        ],
        features: {
          power: '300W',
          capacity: '4.8L',
          speeds: '10',
          accessories: ['Fouet', 'Batteur plat', 'Crochet pétrisseur']
        },
        specifications: {
          dimensions: '36 x 24 x 37 cm',
          weight: '10.5 kg',
          material: 'Métal moulé',
          warranty: '5 ans',
          color: 'Rouge Empire'
        },
        tags: ['best-seller', 'professional', 'iconic'],
        warranty: '5 ans constructeur',
        isActive: true,
        isFeatured: true,
        isNew: false,
        viewCount: 1250,
        salesCount: 45,
        rating: 4.8,
        reviewCount: 67,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Smeg FAB28 Réfrigérateur Rétro',
        slug: 'smeg-fab28-refrigerateur-retro',
        sku: 'SMEG-FAB28-PINK',
        barcode: '8017709261023',
        description: 'Le réfrigérateur Smeg FAB28 allie style rétro des années 50 et technologie moderne. Avec sa capacité de 270L et sa classe énergétique A+++, il est l\'alliance parfaite du design et de la performance.',
        shortDescription: 'Réfrigérateur rétro 270L classe A+++',
        price: 1299.99,
        compareAtPrice: 1499.99,
        costPrice: 800.00,
        stock: 8,
        lowStockThreshold: 3,
        trackInventory: true,
        allowBackorder: false,
        categoryId: categoryMap['conservation'],
        brandId: brandMap['smeg'],
        weight: 65,
        dimensions: { length: 60, width: 65, height: 151 },
        mainImage: '/images/products/smeg-fab28-pink.jpg',
        images: [
          '/images/products/smeg-fab28-pink.jpg',
          '/images/products/smeg-fab28-pink-2.jpg',
          '/images/products/smeg-fab28-pink-3.jpg'
        ],
        features: {
          capacity: '270L',
          energyClass: 'A+++',
          freezerCapacity: '26L',
          noiseLevel: '38 dB'
        },
        specifications: {
          dimensions: '60 x 65 x 151 cm',
          weight: '65 kg',
          annualConsumption: '124 kWh',
          climateClass: 'SN-T',
          color: 'Rose Cadillac'
        },
        tags: ['retro', 'design', 'energy-efficient'],
        warranty: '2 ans constructeur',
        isActive: true,
        isFeatured: true,
        isNew: false,
        viewCount: 856,
        salesCount: 12,
        rating: 4.6,
        reviewCount: 23,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Breville Barista Express',
        slug: 'breville-barista-express',
        sku: 'BRV-BES870XL',
        barcode: '9312432030069',
        description: 'La Breville Barista Express est une machine à expresso semi-automatique avec moulin intégré. Créez des cafés de qualité barista à la maison avec cette machine tout-en-un.',
        shortDescription: 'Machine expresso avec moulin intégré',
        price: 699.99,
        compareAtPrice: null,
        costPrice: 450.00,
        stock: 15,
        lowStockThreshold: 5,
        trackInventory: true,
        allowBackorder: true,
        categoryId: categoryMap['machines-expresso'],
        brandId: brandMap['breville'],
        weight: 10.8,
        dimensions: { length: 32, width: 31, height: 40 },
        mainImage: '/images/products/breville-barista-express.jpg',
        images: [
          '/images/products/breville-barista-express.jpg',
          '/images/products/breville-barista-express-2.jpg',
          '/images/products/breville-barista-express-3.jpg'
        ],
        features: {
          pressure: '15 bars',
          grinder: 'Intégré conique',
          waterTank: '2L',
          steamWand: 'Buse vapeur 360°'
        },
        specifications: {
          dimensions: '32 x 31 x 40 cm',
          weight: '10.8 kg',
          power: '1850W',
          material: 'Acier inoxydable',
          color: 'Acier brossé'
        },
        tags: ['barista', 'professional', 'all-in-one'],
        warranty: '2 ans constructeur',
        isActive: true,
        isFeatured: false,
        isNew: true,
        viewCount: 542,
        salesCount: 28,
        rating: 4.7,
        reviewCount: 41,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Le Creuset Cocotte Ronde 24cm',
        slug: 'le-creuset-cocotte-ronde-24cm',
        sku: 'LC-21177240902430',
        barcode: '0024147312642',
        description: 'La cocotte ronde en fonte émaillée Le Creuset est idéale pour mijoter, braiser et rôtir. Sa fonte retient et distribue uniformément la chaleur pour des résultats de cuisson parfaits.',
        shortDescription: 'Cocotte en fonte émaillée 4,2L',
        price: 329.99,
        compareAtPrice: 389.99,
        costPrice: 200.00,
        stock: 30,
        lowStockThreshold: 10,
        trackInventory: true,
        allowBackorder: true,
        categoryId: categoryMap['ustensiles'],
        brandId: brandMap['le-creuset'],
        weight: 4.7,
        dimensions: { length: 31, width: 24, height: 15 },
        mainImage: '/images/products/le-creuset-cocotte-orange.jpg',
        images: [
          '/images/products/le-creuset-cocotte-orange.jpg',
          '/images/products/le-creuset-cocotte-orange-2.jpg',
          '/images/products/le-creuset-cocotte-orange-3.jpg'
        ],
        features: {
          capacity: '4.2L',
          material: 'Fonte émaillée',
          compatibleHeat: 'Tous feux + four',
          lid: 'Couvercle hermétique'
        },
        specifications: {
          dimensions: '31 x 24 x 15 cm',
          weight: '4.7 kg',
          dishwasherSafe: 'Oui',
          ovenSafe: 'Jusqu\'à 260°C',
          color: 'Orange Volcanique'
        },
        tags: ['classic', 'durable', 'versatile'],
        warranty: 'Garantie à vie',
        isActive: true,
        isFeatured: true,
        isNew: false,
        viewCount: 1024,
        salesCount: 52,
        rating: 4.9,
        reviewCount: 78,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Cuisinart Food Processor 14 Tasses',
        slug: 'cuisinart-food-processor-14-tasses',
        sku: 'CUI-DFP14BCNY',
        barcode: '086279013552',
        description: 'Le robot culinaire Cuisinart 14 tasses est parfait pour les grandes préparations. Avec ses multiples lames et disques, il hache, tranche, râpe et mélange avec précision.',
        shortDescription: 'Robot culinaire grande capacité 14 tasses',
        price: 249.99,
        compareAtPrice: 299.99,
        costPrice: 150.00,
        stock: 18,
        lowStockThreshold: 5,
        trackInventory: true,
        allowBackorder: true,
        categoryId: categoryMap['robots-cuisine'],
        brandId: brandMap['cuisinart'],
        weight: 8.2,
        dimensions: { length: 28, width: 23, height: 43 },
        mainImage: '/images/products/cuisinart-food-processor.jpg',
        images: [
          '/images/products/cuisinart-food-processor.jpg',
          '/images/products/cuisinart-food-processor-2.jpg',
          '/images/products/cuisinart-food-processor-3.jpg'
        ],
        features: {
          capacity: '14 tasses (3.5L)',
          motor: '720W',
          speeds: '2 + pulse',
          accessories: ['Lame en S', 'Disque éminceur', 'Disque râpe', 'Lame pétrissage']
        },
        specifications: {
          dimensions: '28 x 23 x 43 cm',
          weight: '8.2 kg',
          material: 'Plastique sans BPA',
          cordLength: '90 cm',
          color: 'Blanc'
        },
        tags: ['large-capacity', 'versatile', 'professional'],
        warranty: '3 ans constructeur',
        isActive: true,
        isFeatured: false,
        isNew: false,
        viewCount: 423,
        salesCount: 19,
        rating: 4.5,
        reviewCount: 32,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('products', products);
    console.log('✓ Products seeded successfully');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('products', null, {});
  }
};