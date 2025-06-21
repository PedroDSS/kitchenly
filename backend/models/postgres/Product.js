'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Product.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
      Product.belongsTo(models.Brand, { foreignKey: 'brandId', as: 'brand' });
      Product.hasMany(models.OrderItem, { foreignKey: 'productId', as: 'orderItems' });
      Product.hasMany(models.CartItem, { foreignKey: 'productId', as: 'cartItems' });
      Product.hasMany(models.StockMovement, { foreignKey: 'productId', as: 'stockMovements' });
      Product.hasMany(models.EmailAlert, { foreignKey: 'productId', as: 'emailAlerts' });
    }

    static addHooks(models) {
      Product.addHook('beforeCreate', (product) => {
        if (product.name && !product.slug) {
          product.slug = product.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        }
      });

      Product.addHook('beforeUpdate', (product, { fields }) => {
        if (fields.includes('name') && !fields.includes('slug')) {
          product.slug = product.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        }
      });
    }

    isInStock() {
      return this.stock > 0;
    }

    canReserve(quantity) {
      return this.stock >= quantity;
    }

    async decrementStock(quantity) {
      if (this.stock < quantity) {
        throw new Error('Insufficient stock');
      }
      this.stock -= quantity;
      await this.save();
    }

    async incrementStock(quantity) {
      this.stock += quantity;
      await this.save();
    }
  }

  Product.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Product name is required'
        }
      }
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    shortDescription: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Price must be greater than or equal to 0'
        }
      }
    },
    compareAtPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Compare at price must be greater than or equal to 0'
        }
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Stock cannot be negative'
        }
      }
    },
    sku: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    mainImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    brandId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'brands',
        key: 'id'
      }
    },
    weight: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      comment: 'Weight in kilograms'
    },
    dimensions: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Dimensions in cm: {length, width, height}'
    },
    features: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Array of product features'
    },
    specifications: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Technical specifications as key-value pairs'
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    salesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5
      }
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    paranoid: true,
    timestamps: true,
    defaultScope: {
      where: {
        isActive: true
      }
    },
    scopes: {
      withInactive: {
        where: {}
      },
      inStock: {
        where: {
          stock: {
            [sequelize.Sequelize.Op.gt]: 0
          }
        }
      },
      featured: {
        where: {
          isFeatured: true
        }
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['slug']
      },
      {
        unique: true,
        fields: ['sku']
      },
      {
        fields: ['categoryId']
      },
      {
        fields: ['brandId']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['isFeatured']
      },
      {
        fields: ['price']
      },
      {
        fields: ['stock']
      }
    ]
  });

  return Product;
};