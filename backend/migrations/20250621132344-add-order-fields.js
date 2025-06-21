'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add new fields to orders table
    await queryInterface.addColumn('orders', 'cancelReason', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('orders', 'returnReason', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Add new fields to order_items table
    await queryInterface.addColumn('order_items', 'returnedQuantity', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });

    await queryInterface.addColumn('order_items', 'returnedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove fields from orders table
    await queryInterface.removeColumn('orders', 'cancelReason');
    await queryInterface.removeColumn('orders', 'returnReason');

    // Remove fields from order_items table
    await queryInterface.removeColumn('order_items', 'returnedQuantity');
    await queryInterface.removeColumn('order_items', 'returnedAt');
  }
};
