import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";
import denormalizeProduct from "../../services/denormalization/product.js";

const Images = sequelize.define("Images", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  width: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  height: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  format: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    references: {
      model: "Products",
      key: "id",
    },
    onDelete: "CASCADE",
    allowNull: false,
  },
}, {
  timestamps: true,
  hooks: {
    afterCreate: async (image, options) => {
      const { default: Products } = await import('./productModel.js');
      await denormalizeProduct(image.productId, { Product: Products, Images: Images });
    },
    afterUpdate: async (image, options) => {
      const { default: Products } = await import('./productModel.js');
      await denormalizeProduct(image.productId, { Product: Products, Images: Images });
    },
    afterDestroy: async (image, options) => {
      const { default: Products } = await import('./productModel.js');
      await denormalizeProduct(image.productId, { Product: Products, Images: Images });
    },
  },
});

export default Images;
