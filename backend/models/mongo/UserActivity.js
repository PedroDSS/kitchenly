const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  activityType: {
    type: String,
    required: true,
    enum: [
      'page_view',
      'product_view',
      'product_click',
      'add_to_cart',
      'remove_from_cart',
      'checkout_start',
      'checkout_complete',
      'search',
      'filter_apply',
      'wishlist_add',
      'wishlist_remove',
      'review_submit',
      'email_open',
      'email_click',
      'account_login',
      'account_logout',
      'account_register',
      'password_reset',
      'newsletter_subscribe',
      'newsletter_unsubscribe'
    ],
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  pageUrl: {
    type: String,
    required: true
  },
  referrer: String,
  ipAddress: String,
  userAgent: String,
  device: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'other']
    },
    browser: String,
    os: String,
    viewport: {
      width: Number,
      height: Number
    }
  },
  location: {
    country: String,
    region: String,
    city: String,
    postalCode: String,
    coordinates: {
      type: {
        type: String,
        default: 'Point'
      },
      coordinates: [Number]
    }
  },
  productData: {
    productId: Number,
    name: String,
    category: String,
    brand: String,
    price: Number,
    position: Number
  },
  searchData: {
    query: String,
    resultsCount: Number,
    clickedPosition: Number,
    filters: mongoose.Schema.Types.Mixed
  },
  cartData: {
    productId: Number,
    quantity: Number,
    cartValue: Number
  },
  orderData: {
    orderId: Number,
    orderValue: Number,
    itemCount: Number,
    paymentMethod: String,
    deliveryMethod: String
  },
  emailData: {
    campaignId: String,
    emailType: String,
    linkClicked: String
  },
  performance: {
    pageLoadTime: Number,
    timeOnPage: Number,
    scrollDepth: Number,
    clickCount: Number
  },
  abTestData: {
    testId: String,
    variant: String
  },
  customData: mongoose.Schema.Types.Mixed
}, {
  timestamps: true,
  timeseries: {
    timeField: 'timestamp',
    metaField: 'userId',
    granularity: 'minutes'
  }
});

userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ sessionId: 1, timestamp: -1 });
userActivitySchema.index({ activityType: 1, timestamp: -1 });
userActivitySchema.index({ 'productData.productId': 1, timestamp: -1 });
userActivitySchema.index({ timestamp: -1 });
userActivitySchema.index({ 'location.coordinates': '2dsphere' });

userActivitySchema.statics.getUserJourney = async function(userId, startDate, endDate) {
  return this.find({
    userId,
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  })
  .sort({ timestamp: 1 })
  .lean();
};

userActivitySchema.statics.getSessionActivities = async function(sessionId) {
  return this.find({ sessionId })
    .sort({ timestamp: 1 })
    .lean();
};

userActivitySchema.statics.getMostViewedProducts = async function(startDate, endDate, limit = 10) {
  return this.aggregate([
    {
      $match: {
        activityType: 'product_view',
        timestamp: { $gte: startDate, $lte: endDate },
        'productData.productId': { $exists: true }
      }
    },
    {
      $group: {
        _id: '$productData.productId',
        viewCount: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
        productName: { $first: '$productData.name' },
        category: { $first: '$productData.category' },
        brand: { $first: '$productData.brand' }
      }
    },
    {
      $project: {
        productId: '$_id',
        viewCount: 1,
        uniqueUserCount: { $size: '$uniqueUsers' },
        productName: 1,
        category: 1,
        brand: 1
      }
    },
    { $sort: { viewCount: -1 } },
    { $limit: limit }
  ]);
};

userActivitySchema.statics.getConversionFunnel = async function(startDate, endDate) {
  const stages = [
    'product_view',
    'add_to_cart',
    'checkout_start',
    'checkout_complete'
  ];

  const pipeline = stages.map(stage => ({
    $match: {
      activityType: stage,
      timestamp: { $gte: startDate, $lte: endDate }
    }
  }));

  const results = await Promise.all(
    pipeline.map(stage => this.aggregate([
      stage,
      { $group: { _id: null, uniqueUsers: { $addToSet: '$userId' } } },
      { $project: { count: { $size: '$uniqueUsers' } } }
    ]))
  );

  return stages.map((stage, index) => ({
    stage,
    users: results[index][0]?.count || 0,
    dropoffRate: index > 0 ? 
      ((results[index - 1][0]?.count || 0) - (results[index][0]?.count || 0)) / (results[index - 1][0]?.count || 1) * 100 : 0
  }));
};

userActivitySchema.statics.getSearchInsights = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        activityType: 'search',
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$searchData.query',
        searchCount: { $sum: 1 },
        avgResultsCount: { $avg: '$searchData.resultsCount' },
        clickThroughRate: {
          $avg: {
            $cond: [
              { $gt: ['$searchData.clickedPosition', 0] },
              1,
              0
            ]
          }
        }
      }
    },
    { $sort: { searchCount: -1 } },
    { $limit: 50 }
  ]);
};

userActivitySchema.statics.getUserSegmentation = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$userId',
        activityCount: { $sum: 1 },
        lastActivity: { $max: '$timestamp' },
        purchaseCount: {
          $sum: {
            $cond: [{ $eq: ['$activityType', 'checkout_complete'] }, 1, 0]
          }
        },
        totalSpent: {
          $sum: {
            $cond: [
              { $eq: ['$activityType', 'checkout_complete'] },
              '$orderData.orderValue',
              0
            ]
          }
        },
        favoriteCategory: { $first: '$productData.category' },
        devices: { $addToSet: '$device.type' }
      }
    },
    {
      $project: {
        userId: '$_id',
        activityCount: 1,
        lastActivity: 1,
        purchaseCount: 1,
        totalSpent: 1,
        favoriteCategory: 1,
        devices: 1,
        segment: {
          $switch: {
            branches: [
              { case: { $gte: ['$totalSpent', 1000] }, then: 'vip' },
              { case: { $gte: ['$purchaseCount', 3] }, then: 'loyal' },
              { case: { $gte: ['$purchaseCount', 1] }, then: 'customer' },
              { case: { $gte: ['$activityCount', 10] }, then: 'engaged' }
            ],
            default: 'visitor'
          }
        }
      }
    }
  ]);
};

userActivitySchema.statics.getRealTimeMetrics = async function(minutes = 5) {
  const startTime = new Date();
  startTime.setMinutes(startTime.getMinutes() - minutes);

  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: startTime }
      }
    },
    {
      $group: {
        _id: null,
        activeUsers: { $addToSet: '$userId' },
        activeSessions: { $addToSet: '$sessionId' },
        pageViews: {
          $sum: {
            $cond: [{ $eq: ['$activityType', 'page_view'] }, 1, 0]
          }
        },
        productViews: {
          $sum: {
            $cond: [{ $eq: ['$activityType', 'product_view'] }, 1, 0]
          }
        },
        addToCarts: {
          $sum: {
            $cond: [{ $eq: ['$activityType', 'add_to_cart'] }, 1, 0]
          }
        },
        checkouts: {
          $sum: {
            $cond: [{ $eq: ['$activityType', 'checkout_complete'] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        activeUsers: { $size: '$activeUsers' },
        activeSessions: { $size: '$activeSessions' },
        pageViews: 1,
        productViews: 1,
        addToCarts: 1,
        checkouts: 1
      }
    }
  ]);
};

module.exports = mongoose.model('UserActivity', userActivitySchema);