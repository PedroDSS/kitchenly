import db from '../models/index.js';

export const up = async ({ context: queryInterface }) => {
  const { sequelize } = db;
  const alerts = [
    {
      type: 'price_drop'
    },
    {
      type: 'back_in_stock'
    },
    {
      type: 'new_product'
    },
    {
      type: 'category_sale'
    }
  ];

  await sequelize.getQueryInterface().bulkInsert('Alerts', alerts, {});
};

export const down = async ({ context: queryInterface }) => {
  const { sequelize } = db;
  await sequelize.getQueryInterface().bulkDelete('Alerts', null, {});
};