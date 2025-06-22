'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create demo users
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

    // Create brands
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

    // Create categories with hierarchy
    const categories = [
      // Parent categories
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

    // Add subcategories
    const parentCategories = await queryInterface.sequelize.query(
      'SELECT id, slug FROM categories WHERE "parentId" IS NULL',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const categoryMap = {};
    parentCategories.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });

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

    // Get all categories for product creation
    const allCategories = await queryInterface.sequelize.query(
      'SELECT id, slug FROM categories',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const fullCategoryMap = {};
    allCategories.forEach(cat => {
      fullCategoryMap[cat.slug] = cat.id;
    });

    // Get all brands for product creation
    const allBrands = await queryInterface.sequelize.query(
      'SELECT id, slug FROM brands',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const brandMap = {};
    allBrands.forEach(brand => {
      brandMap[brand.slug] = brand.id;
    });

    // Create products
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
        categoryId: fullCategoryMap['robots-cuisine'],
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
        categoryId: fullCategoryMap['conservation'],
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
        categoryId: fullCategoryMap['machines-expresso'],
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
        categoryId: fullCategoryMap['ustensiles'],
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
        categoryId: fullCategoryMap['robots-cuisine'],
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

    // Create relay points
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

    // Create delivery options
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

    // Create promo codes
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
        categoryId: categoryMap['cafe-boissons'],
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

    // Create carts for users
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

    console.log('Seed data inserted successfully!');
  },

  down: async (queryInterface, Sequelize) => {
    // Remove data in reverse order to avoid foreign key constraints
    await queryInterface.bulkDelete('stock_movements', null, {});
    await queryInterface.bulkDelete('payment_transactions', null, {});
    await queryInterface.bulkDelete('invoices', null, {});
    await queryInterface.bulkDelete('order_items', null, {});
    await queryInterface.bulkDelete('orders', null, {});
    await queryInterface.bulkDelete('cart_items', null, {});
    await queryInterface.bulkDelete('email_alerts', null, {});
    await queryInterface.bulkDelete('carts', null, {});
    await queryInterface.bulkDelete('delivery_options', null, {});
    await queryInterface.bulkDelete('promo_codes', null, {});
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('relay_points', null, {});
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('brands', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};