'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Brand extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Brand.hasMany(models.Product, { foreignKey: 'brandId', as: 'products' });
    }

    static addHooks(models) {
      Brand.addHook('beforeCreate', (brand) => {
        if (brand.name && !brand.slug) {
          brand.slug = brand.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        }
      });

      Brand.addHook('beforeUpdate', (brand, { fields }) => {
        if (fields.includes('name') && !fields.includes('slug')) {
          brand.slug = brand.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        }
      });
    }
  }

  Brand.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'Brand name is required'
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
      allowNull: true
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Must be a valid URL'
        }
      }
    },
    country: {
      type: DataTypes.STRING(2),
      allowNull: true,
      comment: 'ISO 3166-1 alpha-2 country code'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    metaTitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    metaDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Brand',
    tableName: 'brands',
    paranoid: true,
    timestamps: true,
    defaultScope: {
      where: {
        isActive: true
      },
      order: [['displayOrder', 'ASC'], ['name', 'ASC']]
    },
    scopes: {
      withInactive: {
        where: {}
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
        fields: ['isActive']
      },
      {
        fields: ['isFeatured']
      },
      {
        fields: ['displayOrder']
      }
    ]
  });

  return Brand;
};