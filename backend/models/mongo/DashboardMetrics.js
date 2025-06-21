const mongoose = require('mongoose');

const dashboardMetricsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  period: {
    type: String,
    required: true,
    enum: ['hour', 'day', 'week', 'month', 'quarter', 'year'],
    index: true
  },
  metrics: {
    revenue: {
      total: {
        type: Number,
        default: 0
      },
      orderCount: {
        type: Number,
        default: 0
      },
      averageOrderValue: {
        type: Number,
        default: 0
      },
      byCategory: [{
        categoryId: Number,
        categoryName: String,
        revenue: Number,
        orderCount: Number
      }],
      byBrand: [{
        brandId: Number,
        brandName: String,
        revenue: Number,
        orderCount: Number
      }],
      byPaymentMethod: [{
        method: String,
        revenue: Number,
        orderCount: Number
      }]
    },
    users: {
      newRegistrations: {
        type: Number,
        default: 0
      },
      activeUsers: {
        type: Number,
        default: 0
      },
      returningUsers: {
        type: Number,
        default: 0
      },
      conversionRate: {
        type: Number,
        default: 0
      },
      byRole: [{
        role: String,
        count: Number
      }],
      byLocation: [{
        country: String,
        region: String,
        userCount: Number
      }]
    },
    products: {
      viewCount: {
        type: Number,
        default: 0
      },
      uniqueViewers: {
        type: Number,
        default: 0
      },
      addToCartCount: {
        type: Number,
        default: 0
      },
      purchaseCount: {
        type: Number,
        default: 0
      },
      topViewed: [{
        productId: Number,
        name: String,
        viewCount: Number,
        conversionRate: Number
      }],
      topSelling: [{
        productId: Number,
        name: String,
        quantity: Number,
        revenue: Number
      }],
      lowStock: [{
        productId: Number,
        name: String,
        currentStock: Number,
        reorderPoint: Number
      }]
    },
    inventory: {
      totalValue: {
        type: Number,
        default: 0
      },
      totalProducts: {
        type: Number,
        default: 0
      },
      outOfStock: {
        type: Number,
        default: 0
      },
      lowStock: {
        type: Number,
        default: 0
      },
      turnoverRate: {
        type: Number,
        default: 0
      },
      movements: [{
        type: String,
        count: Number,
        totalQuantity: Number
      }]
    },
    marketing: {
      emailsSent: {
        type: Number,
        default: 0
      },
      emailOpenRate: {
        type: Number,
        default: 0
      },
      emailClickRate: {
        type: Number,
        default: 0
      },
      newsletterSubscriptions: {
        type: Number,
        default: 0
      },
      newsletterUnsubscriptions: {
        type: Number,
        default: 0
      },
      promoCodeUsage: [{
        code: String,
        usageCount: Number,
        discountGiven: Number,
        revenueGenerated: Number
      }],
      campaignPerformance: [{
        campaignId: String,
        name: String,
        impressions: Number,
        clicks: Number,
        conversions: Number,
        revenue: Number
      }]
    },
    customerService: {
      ticketsCreated: {
        type: Number,
        default: 0
      },
      ticketsResolved: {
        type: Number,
        default: 0
      },
      averageResolutionTime: {
        type: Number,
        default: 0
      },
      customerSatisfactionScore: {
        type: Number,
        default: 0
      },
      returns: {
        count: {
          type: Number,
          default: 0
        },
        value: {
          type: Number,
          default: 0
        },
        reasons: [{
          reason: String,
          count: Number
        }]
      }
    },
    performance: {
      pageLoadTime: {
        average: Number,
        p50: Number,
        p95: Number,
        p99: Number
      },
      apiResponseTime: {
        average: Number,
        p50: Number,
        p95: Number,
        p99: Number
      },
      errorRate: {
        type: Number,
        default: 0
      },
      uptime: {
        type: Number,
        default: 100
      },
      searchPerformance: {
        averageResponseTime: Number,
        searchesPerMinute: Number,
        noResultsRate: Number
      }
    },
    financial: {
      grossProfit: {
        type: Number,
        default: 0
      },
      netProfit: {
        type: Number,
        default: 0
      },
      profitMargin: {
        type: Number,
        default: 0
      },
      refunds: {
        count: {
          type: Number,
          default: 0
        },
        value: {
          type: Number,
          default: 0
        }
      },
      taxes: {
        collected: {
          type: Number,
          default: 0
        },
        rate: {
          type: Number,
          default: 0
        }
      }
    }
  },
  comparisons: {
    previousPeriod: {
      revenue: {
        value: Number,
        percentageChange: Number
      },
      orderCount: {
        value: Number,
        percentageChange: Number
      },
      activeUsers: {
        value: Number,
        percentageChange: Number
      },
      conversionRate: {
        value: Number,
        percentageChange: Number
      }
    },
    yearOverYear: {
      revenue: {
        value: Number,
        percentageChange: Number
      },
      orderCount: {
        value: Number,
        percentageChange: Number
      },
      activeUsers: {
        value: Number,
        percentageChange: Number
      },
      conversionRate: {
        value: Number,
        percentageChange: Number
      }
    }
  },
  calculatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

dashboardMetricsSchema.index({ date: -1, period: 1 });
dashboardMetricsSchema.index({ period: 1, date: -1 });
dashboardMetricsSchema.index({ calculatedAt: -1 });

dashboardMetricsSchema.statics.getLatestMetrics = async function(period = 'day') {
  return this.findOne({ period })
    .sort({ date: -1 })
    .lean();
};

dashboardMetricsSchema.statics.getMetricsRange = async function(startDate, endDate, period = 'day') {
  return this.find({
    period,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  })
  .sort({ date: 1 })
  .lean();
};

dashboardMetricsSchema.statics.calculateGrowth = function(current, previous) {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

dashboardMetricsSchema.statics.aggregateMetricsByPeriod = async function(metric, period, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        period,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: `$metrics.${metric}` },
        average: { $avg: `$metrics.${metric}` },
        min: { $min: `$metrics.${metric}` },
        max: { $max: `$metrics.${metric}` },
        count: { $sum: 1 }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || { total: 0, average: 0, min: 0, max: 0, count: 0 };
};

dashboardMetricsSchema.statics.getTopPerformers = async function(category, limit = 10, period = 'day') {
  const latestMetrics = await this.findOne({ period })
    .sort({ date: -1 })
    .lean();

  if (!latestMetrics) return [];

  switch (category) {
    case 'products':
      return latestMetrics.metrics.products.topSelling.slice(0, limit);
    case 'categories':
      return latestMetrics.metrics.revenue.byCategory
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);
    case 'brands':
      return latestMetrics.metrics.revenue.byBrand
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);
    default:
      return [];
  }
};

dashboardMetricsSchema.statics.getAlerts = async function() {
  const latestMetrics = await this.findOne({ period: 'day' })
    .sort({ date: -1 })
    .lean();

  if (!latestMetrics) return [];

  const alerts = [];

  if (latestMetrics.metrics.inventory.lowStock > 10) {
    alerts.push({
      type: 'warning',
      category: 'inventory',
      message: `${latestMetrics.metrics.inventory.lowStock} products are low on stock`,
      value: latestMetrics.metrics.inventory.lowStock
    });
  }

  if (latestMetrics.metrics.inventory.outOfStock > 0) {
    alerts.push({
      type: 'critical',
      category: 'inventory',
      message: `${latestMetrics.metrics.inventory.outOfStock} products are out of stock`,
      value: latestMetrics.metrics.inventory.outOfStock
    });
  }

  if (latestMetrics.metrics.performance.errorRate > 1) {
    alerts.push({
      type: 'warning',
      category: 'performance',
      message: `Error rate is at ${latestMetrics.metrics.performance.errorRate.toFixed(2)}%`,
      value: latestMetrics.metrics.performance.errorRate
    });
  }

  if (latestMetrics.comparisons.previousPeriod.revenue.percentageChange < -10) {
    alerts.push({
      type: 'warning',
      category: 'revenue',
      message: `Revenue decreased by ${Math.abs(latestMetrics.comparisons.previousPeriod.revenue.percentageChange).toFixed(1)}% compared to previous period`,
      value: latestMetrics.comparisons.previousPeriod.revenue.percentageChange
    });
  }

  return alerts;
};

module.exports = mongoose.model('DashboardMetrics', dashboardMetricsSchema);