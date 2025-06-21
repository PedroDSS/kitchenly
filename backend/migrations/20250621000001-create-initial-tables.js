'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create User table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      dateOfBirth: {
        type: Sequelize.DATE,
        allowNull: true
      },
      roles: {
        type: Sequelize.ARRAY(Sequelize.ENUM('ROLE_USER', 'ROLE_STORE_KEEPER', 'ROLE_ADMIN', 'ROLE_COMPTA')),
        defaultValue: ['ROLE_USER'],
        allowNull: false
      },
      customerType: {
        type: Sequelize.ENUM('B2C', 'B2B'),
        defaultValue: 'B2C',
        allowNull: false
      },
      companyName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      siret: {
        type: Sequelize.STRING,
        allowNull: true
      },
      vatNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isEmailConfirmed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      confirmationToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      confirmationTokenExpiry: {
        type: Sequelize.DATE,
        allowNull: true
      },
      resetPasswordToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      resetPasswordExpiry: {
        type: Sequelize.DATE,
        allowNull: true
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      failedLoginAttempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      lockoutUntil: {
        type: Sequelize.DATE,
        allowNull: true
      },
      passwordChangedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      preferences: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      acceptsMarketing: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      gdprConsentDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      dataRetentionDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 2. Create Brand table
    await queryInterface.createTable('brands', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      logo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      country: {
        type: Sequelize.STRING(2),
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      isFeatured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      displayOrder: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 3. Create Category table (with self-reference)
    await queryInterface.createTable('categories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      parentId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      isFeatured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      displayOrder: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 4. Create RelayPoint table
    await queryInterface.createTable('relay_points', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      externalId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('post_office', 'partner_shop', 'locker'),
        allowNull: false
      },
      carrier: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      coordinates: {
        type: Sequelize.GEOMETRY('POINT'),
        allowNull: false
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      openingHours: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      closureDates: {
        type: Sequelize.ARRAY(Sequelize.DATE),
        defaultValue: [],
        allowNull: false
      },
      services: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
        allowNull: false
      },
      parkingAvailable: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      wheelchairAccessible: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      maxParcelWeight: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      maxParcelSize: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      currentLoad: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      lastSyncAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 5. Create Product table
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      sku: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      barcode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      shortDescription: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      compareAtPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      costPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      stock: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      lowStockThreshold: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
        allowNull: false
      },
      trackInventory: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      allowBackorder: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      categoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      brandId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'brands',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      weight: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true
      },
      dimensions: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      mainImage: {
        type: Sequelize.STRING,
        allowNull: true
      },
      images: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
        allowNull: false
      },
      features: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      specifications: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
        allowNull: false
      },
      warranty: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      isFeatured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      isNew: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      viewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      salesCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      rating: {
        type: Sequelize.DECIMAL(2, 1),
        defaultValue: 0,
        allowNull: false
      },
      reviewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 6. Create PromoCode table
    await queryInterface.createTable('promo_codes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('percentage', 'fixed_amount'),
        allowNull: false
      },
      discount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      minimumAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      maxUses: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      maxUsesPerUser: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      usageCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      categoryId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      userRestrictions: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        defaultValue: [],
        allowNull: false
      },
      excludedProductIds: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        defaultValue: [],
        allowNull: false
      },
      excludedCategoryIds: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        defaultValue: [],
        allowNull: false
      },
      validFrom: {
        type: Sequelize.DATE,
        allowNull: false
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 7. Create DeliveryOption table
    await queryInterface.createTable('delivery_options', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('standard', 'express', 'relay_point'),
        allowNull: false
      },
      carrier: {
        type: Sequelize.STRING,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      pricingType: {
        type: Sequelize.ENUM('fixed', 'weight_based', 'zone_based'),
        defaultValue: 'fixed',
        allowNull: false
      },
      pricingRules: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      estimatedDays: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      cutoffTime: {
        type: Sequelize.TIME,
        allowNull: true
      },
      maxWeight: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      maxDimensions: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      availableCountries: {
        type: Sequelize.ARRAY(Sequelize.STRING(2)),
        defaultValue: ['FR'],
        allowNull: false
      },
      excludedPostalCodes: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
        allowNull: false
      },
      relayPointId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'relay_points',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      trackingAvailable: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      signatureRequired: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      insuranceAvailable: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      insurancePrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      displayOrder: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 8. Create Cart table
    await queryInterface.createTable('carts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sessionId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'EUR',
        allowNull: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      discountAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      promoCodeId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'promo_codes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      promoCodeDiscount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      abandonedEmailSent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      lastActivityAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 9. Create EmailAlert table
    await queryInterface.createTable('email_alerts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('price_drop', 'back_in_stock', 'new_product', 'low_stock'),
        allowNull: false
      },
      categoryId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      frequency: {
        type: Sequelize.ENUM('immediate', 'daily', 'weekly'),
        defaultValue: 'immediate',
        allowNull: false
      },
      threshold: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      lastPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      lastStock: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      lastCheckedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      lastSentAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      sendCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 10. Create CartItem table
    await queryInterface.createTable('cart_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      cartId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'carts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      unitPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      productOptions: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      discountAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      addedFrom: {
        type: Sequelize.STRING,
        allowNull: true
      },
      reservedUntil: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 11. Create Order table
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      orderNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'),
        defaultValue: 'pending',
        allowNull: false
      },
      paymentStatus: {
        type: Sequelize.ENUM('pending', 'paid', 'failed', 'refunded', 'partial_refund'),
        defaultValue: 'pending',
        allowNull: false
      },
      paymentMethod: {
        type: Sequelize.ENUM('stripe', 'paypal'),
        allowNull: true
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'EUR',
        allowNull: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      discountAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      promoCodeId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'promo_codes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      promoCodeDiscount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      taxRate: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 20,
        allowNull: false
      },
      taxAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      deliveryFee: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      insuranceFee: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      refundedAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      billingAddress: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      shippingAddress: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      deliveryMethod: {
        type: Sequelize.ENUM('standard', 'express', 'relay_point'),
        allowNull: false
      },
      deliveryOptionId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'delivery_options',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      relayPointId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'relay_points',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      trackingNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      trackingUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      estimatedDeliveryDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      customerNotes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      adminNotes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      giftMessage: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isGift: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      requiresSignature: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      paidAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      shippedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      deliveredAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      cancelledAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      returnedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      refundedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 12. Create OrderItem table
    await queryInterface.createTable('order_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      productName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      productSku: {
        type: Sequelize.STRING,
        allowNull: false
      },
      productImage: {
        type: Sequelize.STRING,
        allowNull: true
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      unitPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      discount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      tax: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      productOptions: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      refundedQuantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      refundedAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      returnReason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      returnedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 13. Create Invoice table
    await queryInterface.createTable('invoices', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      status: {
        type: Sequelize.ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled'),
        defaultValue: 'draft',
        allowNull: false
      },
      issueDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      dueDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      path: {
        type: Sequelize.STRING,
        allowNull: true
      },
      sentAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      paidAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'EUR',
        allowNull: false
      },
      billingInfo: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      companyInfo: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      items: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      discountAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      taxRate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      taxAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      deliveryFee: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      termsAndConditions: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 14. Create PaymentTransaction table
    await queryInterface.createTable('payment_transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      transactionId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      provider: {
        type: Sequelize.ENUM('stripe', 'paypal'),
        allowNull: false
      },
      method: {
        type: Sequelize.STRING,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('payment', 'refund', 'partial_refund'),
        defaultValue: 'payment',
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded', 'partial_refund'),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      refundedAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'EUR',
        allowNull: false
      },
      refundId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      refundReason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      failureCode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      failureMessage: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      rawResponse: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      processedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // 15. Create StockMovement table
    await queryInterface.createTable('stock_movements', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('purchase', 'sale', 'return', 'adjustment', 'damage', 'loss', 'transfer', 'production'),
        allowNull: false
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      reference: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      previousStock: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      newStock: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      supplier: {
        type: Sequelize.STRING,
        allowNull: true
      },
      batchNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      expiryDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create indexes for better performance
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['confirmationToken']);
    await queryInterface.addIndex('users', ['resetPasswordToken']);
    await queryInterface.addIndex('users', ['isActive']);
    await queryInterface.addIndex('users', ['customerType']);

    await queryInterface.addIndex('brands', ['slug']);
    await queryInterface.addIndex('brands', ['isActive']);
    await queryInterface.addIndex('brands', ['isFeatured']);
    await queryInterface.addIndex('brands', ['displayOrder']);

    await queryInterface.addIndex('categories', ['slug']);
    await queryInterface.addIndex('categories', ['parentId']);
    await queryInterface.addIndex('categories', ['isActive']);
    await queryInterface.addIndex('categories', ['isFeatured']);
    await queryInterface.addIndex('categories', ['displayOrder']);

    await queryInterface.addIndex('relay_points', ['externalId']);
    await queryInterface.addIndex('relay_points', ['carrier']);
    await queryInterface.addIndex('relay_points', ['type']);
    await queryInterface.addIndex('relay_points', ['isActive']);
    await queryInterface.addIndex('relay_points', ['coordinates'], {
      type: 'SPATIAL',
      name: 'relay_points_coordinates_idx'
    });

    await queryInterface.addIndex('products', ['slug']);
    await queryInterface.addIndex('products', ['sku']);
    await queryInterface.addIndex('products', ['categoryId']);
    await queryInterface.addIndex('products', ['brandId']);
    await queryInterface.addIndex('products', ['isActive']);
    await queryInterface.addIndex('products', ['isFeatured']);
    await queryInterface.addIndex('products', ['price']);
    await queryInterface.addIndex('products', ['stock']);

    await queryInterface.addIndex('promo_codes', ['code']);
    await queryInterface.addIndex('promo_codes', ['type']);
    await queryInterface.addIndex('promo_codes', ['categoryId']);
    await queryInterface.addIndex('promo_codes', ['productId']);
    await queryInterface.addIndex('promo_codes', ['isActive']);
    await queryInterface.addIndex('promo_codes', ['validFrom']);
    await queryInterface.addIndex('promo_codes', ['expiresAt']);

    await queryInterface.addIndex('delivery_options', ['code']);
    await queryInterface.addIndex('delivery_options', ['type']);
    await queryInterface.addIndex('delivery_options', ['carrier']);
    await queryInterface.addIndex('delivery_options', ['isActive']);
    await queryInterface.addIndex('delivery_options', ['relayPointId']);

    await queryInterface.addIndex('carts', ['userId']);
    await queryInterface.addIndex('carts', ['sessionId']);
    await queryInterface.addIndex('carts', ['expiresAt']);

    await queryInterface.addIndex('email_alerts', ['userId']);
    await queryInterface.addIndex('email_alerts', ['type']);
    await queryInterface.addIndex('email_alerts', ['categoryId']);
    await queryInterface.addIndex('email_alerts', ['productId']);
    await queryInterface.addIndex('email_alerts', ['enabled']);
    await queryInterface.addIndex('email_alerts', ['userId', 'type', 'categoryId', 'productId'], {
      unique: true,
      name: 'email_alerts_unique_idx'
    });

    await queryInterface.addIndex('cart_items', ['cartId']);
    await queryInterface.addIndex('cart_items', ['productId']);
    await queryInterface.addIndex('cart_items', ['reservedUntil']);
    await queryInterface.addIndex('cart_items', ['cartId', 'productId'], {
      unique: true,
      name: 'cart_items_unique_idx'
    });

    await queryInterface.addIndex('orders', ['orderNumber']);
    await queryInterface.addIndex('orders', ['userId']);
    await queryInterface.addIndex('orders', ['status']);
    await queryInterface.addIndex('orders', ['paymentStatus']);
    await queryInterface.addIndex('orders', ['createdAt']);
    await queryInterface.addIndex('orders', ['deliveryMethod']);

    await queryInterface.addIndex('order_items', ['orderId']);
    await queryInterface.addIndex('order_items', ['productId']);

    await queryInterface.addIndex('invoices', ['number']);
    await queryInterface.addIndex('invoices', ['orderId']);
    await queryInterface.addIndex('invoices', ['status']);
    await queryInterface.addIndex('invoices', ['issueDate']);
    await queryInterface.addIndex('invoices', ['dueDate']);

    await queryInterface.addIndex('payment_transactions', ['transactionId']);
    await queryInterface.addIndex('payment_transactions', ['orderId']);
    await queryInterface.addIndex('payment_transactions', ['status']);
    await queryInterface.addIndex('payment_transactions', ['provider']);

    await queryInterface.addIndex('stock_movements', ['productId']);
    await queryInterface.addIndex('stock_movements', ['userId']);
    await queryInterface.addIndex('stock_movements', ['orderId']);
    await queryInterface.addIndex('stock_movements', ['type']);
    await queryInterface.addIndex('stock_movements', ['createdAt']);
    await queryInterface.addIndex('stock_movements', ['batchNumber']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order of creation
    await queryInterface.dropTable('stock_movements');
    await queryInterface.dropTable('payment_transactions');
    await queryInterface.dropTable('invoices');
    await queryInterface.dropTable('order_items');
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('cart_items');
    await queryInterface.dropTable('email_alerts');
    await queryInterface.dropTable('carts');
    await queryInterface.dropTable('delivery_options');
    await queryInterface.dropTable('promo_codes');
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('relay_points');
    await queryInterface.dropTable('categories');
    await queryInterface.dropTable('brands');
    await queryInterface.dropTable('users');
    
    // Drop ENUMs
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_roles";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_customerType";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_relay_points_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_promo_codes_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_delivery_options_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_delivery_options_pricingType";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_email_alerts_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_email_alerts_frequency";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_paymentStatus";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_paymentMethod";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_deliveryMethod";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_invoices_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_payment_transactions_provider";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_payment_transactions_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_payment_transactions_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_stock_movements_type";');
  }
};