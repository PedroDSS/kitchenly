import { DataTypes } from 'sequelize';

export const up = async ({ context: queryInterface }) => {
  await queryInterface.createTable("Products", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    product_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    product_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    product_star_rating: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    product_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // product_minimum_offer_price: {
    //   type: DataTypes.FLOAT,
    //   allowNull: true,
    // },
    product_category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_best_seller: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    delivery: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    product_stock: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    itemModelNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    powerConsumption: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    voltage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    capacity: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dimensions: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    weight: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    energyEfficiencyClass: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    noiseLevel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    warranty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    material: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    series: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    plugType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });
};

export const down = async ({ context: queryInterface }) => {
  await queryInterface.dropTable("Products");
};
