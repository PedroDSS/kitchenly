import db from '../models/index.js';

export const up = async ({ context: queryInterface }) => {
  const { sequelize } = db;
  // Get product IDs - we'll assume they start from 1
  const images = [
    // Samsung Réfrigérateur (ID: 1)
    {
      title: 'Samsung RF23M8070SR Vue de face',
      url: 'https://images.samsung.com/is/image/samsung/ca-rf8000m-fdr-refrigerator-with-flexzone-rf23m8070sr-aa-frontsilver-205014479?$684_547_PNG$',
      description: 'Vue de face du réfrigérateur 4 portes Samsung',
      size: 250000,
      width: 1200,
      height: 1600,
      format: 'jpg',
      productId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Samsung RF23M8070SR Vue intérieure',
      url: 'https://images.samsung.com/is/image/samsung/ca-rf8000m-fdr-refrigerator-with-flexzone-rf23m8070sr-aa-frontopensilver-205014446?$684_547_JPG$',
      description: 'Vue intérieure avec FlexZone',
      size: 230000,
      width: 1200,
      height: 1600,
      format: 'jpg',
      productId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Samsung RF23M8070SR Panneau de contrôle',
      url: 'https://images.samsung.com/is/image/samsung/ca-rf8000m-fdr-refrigerator-with-flexzone-rf23m8070sr-aa-detailsilver-205014453?$684_547_JPG$',
      description: 'Écran tactile et distributeur',
      size: 180000,
      width: 1200,
      height: 900,
      format: 'jpg',
      productId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // LG Réfrigérateur (ID: 2)
    {
      title: 'LG GSL761PZXV Vue de face',
      url: 'https://www.lg.com/fr/images/refrigerateurs/gsl761pzxv-front.jpg',
      description: 'Vue de face avec InstaView',
      size: 240000,
      width: 1200,
      height: 1600,
      format: 'jpg',
      productId: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'LG GSL761PZXV Door-in-Door',
      url: 'https://www.lg.com/fr/images/refrigerateurs/gsl761pzxv-door.jpg',
      description: 'Système Door-in-Door ouvert',
      size: 220000,
      width: 1200,
      height: 1600,
      format: 'jpg',
      productId: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Bosch Lave-linge (ID: 3)
    {
      title: 'Bosch WAX32LH9FF Vue de face',
      url: 'https://media.bosch.com/images/wax32lh9ff-front.jpg',
      description: 'Lave-linge Serie 8 vue de face',
      size: 210000,
      width: 1200,
      height: 1400,
      format: 'jpg',
      productId: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Bosch WAX32LH9FF Panneau de contrôle',
      url: 'https://media.bosch.com/images/wax32lh9ff-control.jpg',
      description: 'Panneau de contrôle avec i-DOS',
      size: 150000,
      width: 1200,
      height: 800,
      format: 'jpg',
      productId: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Bosch WAX32LH9FF Tambour',
      url: 'https://media.bosch.com/images/wax32lh9ff-drum.jpg',
      description: 'Vue du tambour inox',
      size: 190000,
      width: 1200,
      height: 1200,
      format: 'jpg',
      productId: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Samsung Lave-linge (ID: 4)
    {
      title: 'Samsung WW90T684DLH Vue de face',
      url: 'https://images.samsung.com/is/image/samsung/ww90t684dlh-front.jpg',
      description: 'Lave-linge AddWash vue de face',
      size: 200000,
      width: 1200,
      height: 1400,
      format: 'jpg',
      productId: 4,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Samsung WW90T684DLH AddWash',
      url: 'https://images.samsung.com/is/image/samsung/ww90t684dlh-addwash.jpg',
      description: 'Porte AddWash ouverte',
      size: 180000,
      width: 1200,
      height: 1200,
      format: 'jpg',
      productId: 4,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Siemens Four (ID: 5)
    {
      title: 'Siemens HB678GBS6 Vue de face',
      url: 'https://media.siemens.com/images/hb678gbs6-front.jpg',
      description: 'Four encastrable iQ700',
      size: 220000,
      width: 1200,
      height: 1200,
      format: 'jpg',
      productId: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Siemens HB678GBS6 Intérieur',
      url: 'https://media.siemens.com/images/hb678gbs6-interior.jpg',
      description: 'Intérieur avec rails télescopiques',
      size: 200000,
      width: 1200,
      height: 1200,
      format: 'jpg',
      productId: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Panasonic Micro-ondes (ID: 6)
    {
      title: 'Panasonic NN-SD28HSGTG Vue de face',
      url: 'https://www.panasonic.com/content/dam/nn-sd28hsgtg-front.jpg',
      description: 'Micro-ondes Inverter vue de face',
      size: 160000,
      width: 1200,
      height: 900,
      format: 'jpg',
      productId: 6,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Dyson Aspirateur (ID: 7)
    {
      title: 'Dyson V15 Detect Vue complète',
      url: 'https://dyson-cdn.azureedge.net/v15-detect-full.jpg',
      description: 'Aspirateur V15 Detect complet',
      size: 190000,
      width: 1200,
      height: 1600,
      format: 'jpg',
      productId: 7,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Dyson V15 Detect Laser',
      url: 'https://dyson-cdn.azureedge.net/v15-detect-laser.jpg',
      description: 'Technologie laser en action',
      size: 170000,
      width: 1200,
      height: 900,
      format: 'jpg',
      productId: 7,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Dyson V15 Detect Écran LCD',
      url: 'https://dyson-cdn.azureedge.net/v15-detect-lcd.jpg',
      description: 'Écran LCD avec statistiques',
      size: 150000,
      width: 1200,
      height: 900,
      format: 'jpg',
      productId: 7,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Miele Lave-vaisselle (ID: 8)
    {
      title: 'Miele G 7160 SCVi Vue de face',
      url: 'https://media.miele.com/images/g7160scvi-front.jpg',
      description: 'Lave-vaisselle tout intégrable',
      size: 200000,
      width: 1200,
      height: 1400,
      format: 'jpg',
      productId: 8,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Miele G 7160 SCVi Intérieur',
      url: 'https://media.miele.com/images/g7160scvi-interior.jpg',
      description: 'Intérieur avec paniers flexibles',
      size: 210000,
      width: 1200,
      height: 1200,
      format: 'jpg',
      productId: 8,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Daikin Climatiseur (ID: 9)
    {
      title: 'Daikin Emura 3 Vue de face',
      url: 'https://www.daikin.eu/content/dam/emura3-white-front.jpg',
      description: 'Climatiseur design Emura blanc',
      size: 180000,
      width: 1200,
      height: 800,
      format: 'jpg',
      productId: 9,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Daikin Emura 3 Profil',
      url: 'https://www.daikin.eu/content/dam/emura3-white-profile.jpg',
      description: 'Vue de profil ultra-mince',
      size: 160000,
      width: 1200,
      height: 800,
      format: 'jpg',
      productId: 9,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // De'Longhi Cafetière (ID: 10)
    {
      title: 'De\'Longhi Dinamica Plus Vue de face',
      url: 'https://www.delonghi.com/ecam370-95-t-front.jpg',
      description: 'Machine à café automatique titane',
      size: 190000,
      width: 1200,
      height: 1400,
      format: 'jpg',
      productId: 10,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'De\'Longhi Dinamica Plus Écran',
      url: 'https://www.delonghi.com/ecam370-95-t-screen.jpg',
      description: 'Écran tactile couleur 3.5 pouces',
      size: 150000,
      width: 1200,
      height: 900,
      format: 'jpg',
      productId: 10,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'De\'Longhi Dinamica Plus LatteCrema',
      url: 'https://www.delonghi.com/ecam370-95-t-milk.jpg',
      description: 'Système LatteCrema automatique',
      size: 170000,
      width: 1200,
      height: 900,
      format: 'jpg',
      productId: 10,
      createdAt: new Date(),
      updatedAt: new Date()
    },

    // Whirlpool Four (ID: 11)
    {
      title: 'Whirlpool AKZ96230IX Vue de face',
      url: 'https://www.whirlpool.fr/akz96230ix-front.jpg',
      description: 'Four pyrolyse encastrable',
      size: 200000,
      width: 1200,
      height: 1200,
      format: 'jpg',
      productId: 11,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await sequelize.getQueryInterface().bulkInsert('Images', images, {});
};

export const down = async ({ context: queryInterface }) => {
  const { sequelize } = db;
  await sequelize.getQueryInterface().bulkDelete('Images', null, {});
};