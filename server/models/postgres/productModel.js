import { DataTypes } from "sequelize";
import sequelize from "../../config/sequelize-config.js";
import ProductMongo from "../../models/mongo/productModel.js";
import denormalizeProduct from "../../services/denormalization/product.js";
import Images from "./imagesModel.js";

const Products = sequelize.define(
  "Products",
  {
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
    }, // ex: "1500W"
    voltage: {
      type: DataTypes.STRING,
      allowNull: true,
    }, // ex: "220V"
    capacity: {
      type: DataTypes.STRING,
      allowNull: true,
    }, // ex: "7kg", "350L"
    dimensions: {
      type: DataTypes.STRING,
      allowNull: true,
    }, // ex: "60x60x85 cm"
    weight: {
      type: DataTypes.STRING,
      allowNull: true,
    }, // ex: "40kg"
    energyEfficiencyClass: {
      type: DataTypes.STRING,
      allowNull: true,
    }, // ex: "A++"
    noiseLevel: {
      type: DataTypes.STRING,
      allowNull: true,
    }, // ex: "55dB"
    warranty: {
      type: DataTypes.STRING,
      allowNull: true,
    }, // ex: "2 ans"
    material: {
      type: DataTypes.STRING,
      allowNull: true,
    }, // ex: "Acier inoxydable"
    series: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    plugType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    hooks: {
      afterCreate: async (product, options) => {
        await denormalizeProduct({ id: product.id }, { Product: Products });
      },
      afterUpdate: async (product, options) => {
        await denormalizeProduct({ id: product.id }, { Product: Products });
      },
      afterDestroy: async (product, options) => {
        await ProductMongo.findByIdAndDelete(product.id);
      },
    },
  }
);
Products.hasMany(Images, {
  foreignKey: "productId",
  as: "images",
  onDelete: "CASCADE",
});

Images.belongsTo(Products, {
  foreignKey: "productId",
  as: "product",
  onDelete: "CASCADE",
});

export default Products;
