'use strict';
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validatePassword } = require('../../utils/passwordValidator');
const denormalizeUser = require("../../dtos/denormalization/user");

const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Order, { foreignKey: 'userId', as: 'orders' });
      User.hasOne(models.Cart, { foreignKey: 'userId', as: 'cart' });
      User.hasMany(models.EmailAlert, { foreignKey: 'userId', as: 'emailAlerts' });
      User.hasMany(models.StockMovement, { foreignKey: 'userId', as: 'stockMovements' });
    }

    static addHooks(models) {
      User.addHook('beforeCreate', async (user) => {
        if (user.password) {
          validatePassword(user.password);
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      });

      User.addHook('beforeUpdate', async (user, { fields }) => {
        if (fields.includes('password')) {
          validatePassword(user.password);
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
          user.passwordChangedAt = new Date();
        }
      });

      User.addHook('afterCreate', async (user) => {
        await denormalizeUser(user, models);
      });

      User.addHook('afterUpdate', async (user, { fields }) => {
        await denormalizeUser(user, models);
      });
    }

    async comparePassword(candidatePassword) {
      return await bcrypt.compare(candidatePassword, this.password);
    }

    isAccountLocked() {
      return this.accountLockedUntil && this.accountLockedUntil > new Date();
    }

    async incrementFailedAttempts() {
      this.failedLoginAttempts += 1;
      if (this.failedLoginAttempts >= 3) {
        this.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      }
      await this.save();
    }

    async resetFailedAttempts() {
      this.failedLoginAttempts = 0;
      this.accountLockedUntil = null;
      await this.save();
    }

    isPasswordExpired() {
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      return this.passwordChangedAt < sixtyDaysAgo;
    }

    createPasswordResetToken() {
      const resetToken = crypto.randomBytes(32).toString('hex');
      this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      this.resetPasswordExpiry = Date.now() + 10 * 60 * 1000;
      return resetToken;
    }

    createConfirmationToken() {
      const confirmToken = crypto.randomBytes(32).toString('hex');
      this.confirmationToken = crypto
        .createHash('sha256')
        .update(confirmToken)
        .digest('hex');
      this.confirmationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
      return confirmToken;
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Please provide a valid email'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [12, 100],
          msg: 'Password must be at least 12 characters long'
        }
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Please provide your first name'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Please provide your last name'
        }
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^[+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/i
      }
    },
    roles: {
      type: DataTypes.ARRAY(DataTypes.ENUM('ROLE_USER', 'ROLE_STORE_KEEPER', 'ROLE_ADMIN', 'ROLE_COMPTA')),
      defaultValue: ['ROLE_USER']
    },
    isEmailConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    confirmationToken: DataTypes.STRING,
    confirmationTokenExpiry: DataTypes.DATE,
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpiry: DataTypes.DATE,
    failedLoginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    accountLockedUntil: DataTypes.DATE,
    passwordChangedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    lastLoginAt: DataTypes.DATE,
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    customerType: {
      type: DataTypes.ENUM('B2C', 'B2B'),
      defaultValue: 'B2C'
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    vatNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    newsletterSubscribed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    preferredLanguage: {
      type: DataTypes.ENUM('fr', 'en'),
      defaultValue: 'fr'
    },
    gdprConsentDate: DataTypes.DATE,
    deletionRequestedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    paranoid: true,
    timestamps: true,
    defaultScope: {
      attributes: {
        exclude: [
          'password',
          'confirmationToken',
          'confirmationTokenExpiry',
          'resetPasswordToken',
          'resetPasswordExpiry',
          'deletedAt'
        ]
      },
      where: {
        isActive: true
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['confirmationToken']
      },
      {
        fields: ['resetPasswordToken']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['customerType']
      }
    ]
  });

  return User;
};