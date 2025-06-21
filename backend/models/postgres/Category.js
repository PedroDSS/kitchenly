'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Category.hasMany(models.Product, { foreignKey: 'categoryId', as: 'products' });
      Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' });
      Category.hasMany(Category, { foreignKey: 'parentId', as: 'children' });
      Category.hasMany(models.EmailAlert, { foreignKey: 'categoryId', as: 'emailAlerts' });
      Category.hasMany(models.PromoCode, { foreignKey: 'categoryId', as: 'promoCodes' });
    }

    static addHooks(models) {
      Category.addHook('beforeCreate', (category) => {
        if (category.name && !category.slug) {
          category.slug = category.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        }
      });

      Category.addHook('beforeUpdate', (category, { fields }) => {
        if (fields.includes('name') && !fields.includes('slug')) {
          category.slug = category.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        }
      });
    }

    async getAncestors() {
      const ancestors = [];
      let current = this;
      
      while (current.parentId) {
        current = await Category.findByPk(current.parentId);
        if (current) {
          ancestors.push(current);
        } else {
          break;
        }
      }
      
      return ancestors.reverse();
    }

    async getDescendants() {
      const descendants = [];
      const stack = [this];
      
      while (stack.length > 0) {
        const current = stack.pop();
        const children = await Category.findAll({ where: { parentId: current.id } });
        
        for (const child of children) {
          descendants.push(child);
          stack.push(child);
        }
      }
      
      return descendants;
    }
  }

  Category.init({
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
          msg: 'Category name is required'
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
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    metaTitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    metaDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metaKeywords: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
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
      topLevel: {
        where: {
          parentId: null
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
        fields: ['parentId']
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

  return Category;
};