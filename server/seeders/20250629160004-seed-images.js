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
      url: 'https://boulanger.scene7.com/is/image/Boulanger/8806096440315_h_f_l_0?wid=224&hei=224&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=png-alpha',
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
      url: 'https://boulanger.scene7.com/is/image/Boulanger/8806096440315_h_f_l_2?wid=224&hei=224&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=png-alpha',
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
      url: 'https://media3.bsh-group.com/Product_Shots/1000x/25248749_WGB256A2FR_STP_def.webp',
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
      url: 'https://media3.bsh-group.com/Product_Shots/1000x/25249984_WGB256A2FR_PGA1_def.webp',
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
      url: 'https://media3.bsh-group.com/Product_Shots/1000x/25249985_WGB256A2FR_PGA3_def.webp',
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
      url: 'https://boulanger.scene7.com/is/image/Boulanger/8806095550190_h_f_l_0?wid=508&hei=508&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=png-alpha',
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
      url: 'https://boulanger.scene7.com/is/image/Boulanger/8806095550190_h_u_l_2?wid=508&hei=508&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=png-alpha',
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
      url: 'https://boulanger.scene7.com/is/image/Boulanger/4242003956304_h_f_l_0?wid=508&hei=508&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=png-alpha',
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
      url: 'https://boulanger.scene7.com/is/image/Boulanger/4242003956304_h_f_l_4?wid=508&hei=508&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=png-alpha',
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
      url: 'https://image.darty.com/darty?type=image&source=/market/2019/05/14/5662633_1520_1.jpg&width=267&height=400&quality=90&effects=Pad(CC,FFFFFF)',
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
      url: 'https://boulanger.scene7.com/is/image/Boulanger/5025155081754_h_f_l_0?wid=508&hei=508&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=png-alpha',
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
      url: 'https://boulanger.scene7.com/is/image/Boulanger/5025155081754_h_f_l_1?wid=508&hei=508&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=png-alpha',
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
      url: 'https://boulanger.scene7.com/is/image/Boulanger/5025155081754_h_f_l_6?wid=508&hei=508&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=png-alpha',
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
      url: 'https://boulanger.scene7.com/is/image/Boulanger/4002516740810_h_f_l_0?wid=508&hei=508&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=png-alpha',
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
      url: 'https://boulanger.scene7.com/is/image/Boulanger/4002516740810_h_f_l_3?wid=508&hei=508&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=png-alpha',
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
      url: 'https://cdn.manomano.com/images/images_products/22406698/L/82675839_1.jpg',
      description: 'Climatiseur design Emura blanc',
      size: 180000,
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
      url: 'https://m.media-amazon.com/images/I/61oiQLhfcfL._AC_SL1500_.jpg',
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
      url: 'https://m.media-amazon.com/images/I/61Ncd-oISAL._AC_SL1500_.jpg',
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
      url: 'https://m.media-amazon.com/images/I/71Tn6N1YOqL._AC_SL1500_.jpg',
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
      url: 'https://frwhirlpool.vtexassets.com/arquivos/ids/180523-800-auto?v=638678937987330000&width=800&height=auto&aspect=true',
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