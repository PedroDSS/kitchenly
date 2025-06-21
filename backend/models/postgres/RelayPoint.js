'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RelayPoint extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      RelayPoint.hasMany(models.Order, { foreignKey: 'relayPointId', as: 'orders' });
      RelayPoint.hasMany(models.DeliveryOption, { foreignKey: 'relayPointId', as: 'deliveryOptions' });
    }

    static addHooks(models) {
      // No specific hooks needed for RelayPoint
    }

    isOpen(date = new Date()) {
      if (!this.openingHours) return false;
      
      const dayOfWeek = date.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
      const hours = this.openingHours[dayOfWeek];
      
      if (!hours || hours.closed) {
        return false;
      }
      
      const currentTime = date.toTimeString().slice(0, 5);
      return currentTime >= hours.open && currentTime <= hours.close;
    }

    getDistanceFrom(latitude, longitude) {
      if (!this.coordinates || !this.coordinates.coordinates) {
        return null;
      }
      
      const [pointLng, pointLat] = this.coordinates.coordinates;
      
      // Haversine formula for distance calculation
      const R = 6371; // Earth's radius in km
      const dLat = (pointLat - latitude) * Math.PI / 180;
      const dLon = (pointLng - longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(latitude * Math.PI / 180) * Math.cos(pointLat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      
      return R * c;
    }
  }

  RelayPoint.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    externalId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      comment: 'External ID from La Poste or other carrier'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Relay point name is required'
        }
      }
    },
    type: {
      type: DataTypes.ENUM('post_office', 'partner_shop', 'locker'),
      allowNull: false
    },
    carrier: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'La Poste'
    },
    address: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        hasRequiredFields(value) {
          const required = ['street', 'city', 'postalCode', 'country'];
          for (const field of required) {
            if (!value[field]) {
              throw new Error(`Address must include ${field}`);
            }
          }
        }
      }
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[0-9]{5}$/,
        msg: 'Code postal français requis (5 chiffres)'
      }
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'France'
    },
    coordinates: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    openingHours: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Opening hours by day of week'
    },
    holidays: {
      type: DataTypes.ARRAY(DataTypes.DATE),
      defaultValue: [],
      comment: 'List of holidays when closed'
    },
    services: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: 'Available services (printing, packaging, etc.)'
    },
    accessInfo: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Accessibility and access information'
    },
    maxPackageWeight: {
      type: DataTypes.DECIMAL(10, 3),
      defaultValue: 30,
      comment: 'Maximum package weight in kg'
    },
    maxPackageDimensions: {
      type: DataTypes.JSONB,
      defaultValue: { length: 150, width: 100, height: 100 },
      comment: 'Maximum package dimensions in cm'
    },
    parkingAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    wheelchairAccessible: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    accessibilityFeatures: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: 'Caractéristiques d\'accessibilité (rampe, ascenseur, etc.)'
    },
    lockerCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Number of lockers if type is locker'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    temporarilyClosed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'RelayPoint',
    tableName: 'relay_points',
    timestamps: true,
    defaultScope: {
      where: {
        isActive: true,
        temporarilyClosed: false
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['externalId']
      },
      {
        fields: ['carrier']
      },
      {
        fields: ['type']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['coordinates'],
        using: 'GIST'
      }
    ]
  });

  return RelayPoint;
};