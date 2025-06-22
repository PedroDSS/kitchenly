'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DeliveryOption extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DeliveryOption.hasMany(models.Order, { foreignKey: 'deliveryOptionId', as: 'orders' });
      DeliveryOption.belongsTo(models.RelayPoint, { foreignKey: 'relayPointId', as: 'relayPoint' });
    }

    static addHooks(models) {
      // No specific hooks needed for DeliveryOption
    }

    isAvailable() {
      return this.isActive && (!this.availableFrom || this.availableFrom <= new Date()) &&
             (!this.availableUntil || this.availableUntil >= new Date());
    }

    calculatePrice(weight, zone) {
      if (this.pricingType === 'fixed') {
        return this.basePrice || this.price;
      }
      
      // Weight-based pricing
      let price = this.basePrice || this.price;
      if (weight > this.baseWeight) {
        const extraWeight = weight - this.baseWeight;
        price += Math.ceil(extraWeight / this.additionalWeightUnit) * this.additionalWeightPrice;
      }
      
      // Zone-based pricing
      if (this.zonePricing && this.zonePricing[zone]) {
        price += this.zonePricing[zone];
      }
      
      return price;
    }

    checkAvailability(postalCode) {
      // Check if delivery option is available for the given postal code
      if (!this.isActive) return false;
      
      // For now, all active options are available everywhere in France
      // In production, this would check coverage maps
      if (postalCode && !postalCode.match(/^[0-9]{5}$/)) {
        return false; // Invalid French postal code
      }
      
      return this.isAvailable();
    }
  }

  DeliveryOption.init({
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
          msg: 'Delivery option name is required'
        }
      }
    },
    code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [['standard', 'express', 'relay_point']],
          msg: 'Type must be standard, express, or relay_point'
        }
      }
    },
    carrier: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Carrier name (La Poste, etc.)'
    },
    description: {
      type: DataTypes.TEXT,
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
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Base price must be greater than or equal to 0'
        }
      },
      comment: 'Base price for delivery (can be different from price for promotional purposes)'
    },
    pricePerKg: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Additional price per kilogram above base weight'
    },
    pricingType: {
      type: DataTypes.STRING,
      defaultValue: 'fixed',
      validate: {
        isIn: {
          args: [['fixed', 'weight_based', 'zone_based']],
          msg: 'Pricing type must be fixed, weight_based, or zone_based'
        }
      }
    },
    baseWeight: {
      type: DataTypes.DECIMAL(10, 3),
      defaultValue: 0,
      comment: 'Base weight included in price (kg)'
    },
    additionalWeightUnit: {
      type: DataTypes.DECIMAL(10, 3),
      defaultValue: 1,
      comment: 'Additional weight unit for pricing (kg)'
    },
    additionalWeightPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Price per additional weight unit'
    },
    zonePricing: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Zone-based pricing adjustments'
    },
    estimatedDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Estimated delivery time in business days'
    },
    maxWeight: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      comment: 'Maximum weight allowed (kg)'
    },
    maxDimensions: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Maximum dimensions allowed {length, width, height} in cm'
    },
    relayPointId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'relay_points',
        key: 'id'
      }
    },
    trackingAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    signatureRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    insuranceAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    insurancePrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    availableFrom: DataTypes.DATE,
    availableUntil: DataTypes.DATE,
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'DeliveryOption',
    tableName: 'delivery_options',
    timestamps: true,
    defaultScope: {
      where: {
        isActive: true
      },
      order: [['displayOrder', 'ASC'], ['price', 'ASC']]
    },
    indexes: [
      {
        unique: true,
        fields: ['code']
      },
      {
        fields: ['type']
      },
      {
        fields: ['carrier']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['relayPointId']
      }
    ]
  });

  return DeliveryOption;
};