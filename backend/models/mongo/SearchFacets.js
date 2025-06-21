const mongoose = require('mongoose');

const searchFacetsSchema = new mongoose.Schema({
  facetType: {
    type: String,
    required: true,
    enum: ['category', 'brand', 'price', 'attribute', 'tag', 'rating', 'availability'],
    index: true
  },
  facetKey: {
    type: String,
    required: true,
    index: true
  },
  facetValue: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0,
    index: true
  },
  metadata: {
    parentKey: String,
    level: Number,
    sortOrder: Number,
    isActive: {
      type: Boolean,
      default: true
    },
    icon: String,
    color: String,
    description: String
  },
  priceRange: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'EUR'
    }
  },
  hierarchyPath: [{
    key: String,
    name: String,
    level: Number
  }],
  translations: {
    fr: {
      displayName: String,
      description: String
    },
    en: {
      displayName: String,
      description: String
    }
  },
  relatedFacets: [{
    facetType: String,
    facetKey: String,
    correlation: Number
  }],
  searchContext: {
    popularityScore: {
      type: Number,
      default: 0
    },
    clickThroughRate: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    lastClicked: Date,
    searchQueries: [{
      query: String,
      frequency: Number
    }]
  },
  stats: {
    totalProducts: {
      type: Number,
      default: 0
    },
    activeProducts: {
      type: Number,
      default: 0
    },
    averagePrice: {
      type: Number,
      default: 0
    },
    minPrice: {
      type: Number,
      default: 0
    },
    maxPrice: {
      type: Number,
      default: 0
    }
  },
  cacheMetadata: {
    lastCalculated: {
      type: Date,
      default: Date.now,
      index: true
    },
    calculationDuration: Number,
    isStale: {
      type: Boolean,
      default: false
    },
    refreshPriority: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

searchFacetsSchema.index({ facetType: 1, facetKey: 1 }, { unique: true });
searchFacetsSchema.index({ facetType: 1, count: -1 });
searchFacetsSchema.index({ 'searchContext.popularityScore': -1 });
searchFacetsSchema.index({ 'cacheMetadata.lastCalculated': 1 });
searchFacetsSchema.index({ 'cacheMetadata.isStale': 1, 'cacheMetadata.refreshPriority': -1 });

searchFacetsSchema.statics.getFacetsByType = async function(facetType, options = {}) {
  const {
    minCount = 1,
    limit = 50,
    sortBy = 'count',
    includeInactive = false
  } = options;

  const query = {
    facetType,
    count: { $gte: minCount }
  };

  if (!includeInactive) {
    query['metadata.isActive'] = true;
  }

  const sortOptions = {
    count: { count: -1 },
    popularity: { 'searchContext.popularityScore': -1 },
    alphabetical: { displayName: 1 },
    value: { facetValue: 1 }
  };

  return this.find(query)
    .sort(sortOptions[sortBy] || sortOptions.count)
    .limit(limit)
    .lean();
};

searchFacetsSchema.statics.getHierarchicalFacets = async function(facetType, parentKey = null) {
  const query = {
    facetType,
    'metadata.isActive': true
  };

  if (parentKey) {
    query['metadata.parentKey'] = parentKey;
  } else {
    query['metadata.level'] = 0;
  }

  return this.find(query)
    .sort({ 'metadata.sortOrder': 1, count: -1 })
    .lean();
};

searchFacetsSchema.statics.calculateFacets = async function(ProductSearch) {
  const facetCalculations = [
    {
      $match: { isActive: true }
    },
    {
      $facet: {
        categories: [
          { $group: { _id: '$category.slug', count: { $sum: 1 }, name: { $first: '$category.name' } } },
          { $sort: { count: -1 } }
        ],
        brands: [
          { $group: { _id: '$brand.slug', count: { $sum: 1 }, name: { $first: '$brand.name' } } },
          { $sort: { count: -1 } }
        ],
        priceRanges: [
          {
            $bucket: {
              groupBy: '$price',
              boundaries: [0, 25, 50, 100, 250, 500, 1000, 2500, 5000],
              default: 'above_5000',
              output: {
                count: { $sum: 1 },
                min: { $min: '$price' },
                max: { $max: '$price' },
                avg: { $avg: '$price' }
              }
            }
          }
        ],
        tags: [
          { $unwind: '$tags' },
          { $group: { _id: '$tags', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 100 }
        ],
        ratings: [
          {
            $bucket: {
              groupBy: '$rating.average',
              boundaries: [0, 1, 2, 3, 4, 5],
              default: 'no_rating',
              output: { count: { $sum: 1 } }
            }
          }
        ],
        availability: [
          {
            $group: {
              _id: {
                $cond: [{ $gt: ['$stock', 0] }, 'in_stock', 'out_of_stock']
              },
              count: { $sum: 1 }
            }
          }
        ]
      }
    }
  ];

  const results = await ProductSearch.aggregate(facetCalculations);
  const facets = results[0];

  const bulkOps = [];

  facets.categories.forEach(cat => {
    bulkOps.push({
      updateOne: {
        filter: { facetType: 'category', facetKey: cat._id },
        update: {
          $set: {
            facetValue: cat._id,
            displayName: cat.name,
            count: cat.count,
            'cacheMetadata.lastCalculated': new Date(),
            'cacheMetadata.isStale': false
          }
        },
        upsert: true
      }
    });
  });

  facets.brands.forEach(brand => {
    bulkOps.push({
      updateOne: {
        filter: { facetType: 'brand', facetKey: brand._id },
        update: {
          $set: {
            facetValue: brand._id,
            displayName: brand.name,
            count: brand.count,
            'cacheMetadata.lastCalculated': new Date(),
            'cacheMetadata.isStale': false
          }
        },
        upsert: true
      }
    });
  });

  const priceRangeNames = {
    0: '0-25€',
    25: '25-50€',
    50: '50-100€',
    100: '100-250€',
    250: '250-500€',
    500: '500-1000€',
    1000: '1000-2500€',
    2500: '2500-5000€',
    above_5000: '5000€+'
  };

  facets.priceRanges.forEach(range => {
    const key = range._id === 'above_5000' ? 'above_5000' : `${range._id}-${range._id}`;
    bulkOps.push({
      updateOne: {
        filter: { facetType: 'price', facetKey: key },
        update: {
          $set: {
            facetValue: range._id,
            displayName: priceRangeNames[range._id] || `${range._id}€`,
            count: range.count,
            'priceRange.min': range.min,
            'priceRange.max': range.max,
            'stats.averagePrice': range.avg,
            'cacheMetadata.lastCalculated': new Date(),
            'cacheMetadata.isStale': false
          }
        },
        upsert: true
      }
    });
  });

  facets.tags.forEach(tag => {
    bulkOps.push({
      updateOne: {
        filter: { facetType: 'tag', facetKey: tag._id },
        update: {
          $set: {
            facetValue: tag._id,
            displayName: tag._id,
            count: tag.count,
            'cacheMetadata.lastCalculated': new Date(),
            'cacheMetadata.isStale': false
          }
        },
        upsert: true
      }
    });
  });

  const ratingNames = {
    0: 'No rating',
    1: '1 star & up',
    2: '2 stars & up',
    3: '3 stars & up',
    4: '4 stars & up'
  };

  facets.ratings.forEach(rating => {
    if (rating._id !== 'no_rating') {
      bulkOps.push({
        updateOne: {
          filter: { facetType: 'rating', facetKey: `${rating._id}_stars` },
          update: {
            $set: {
              facetValue: rating._id,
              displayName: ratingNames[rating._id] || `${rating._id} stars`,
              count: rating.count,
              'cacheMetadata.lastCalculated': new Date(),
              'cacheMetadata.isStale': false
            }
          },
          upsert: true
        }
      });
    }
  });

  facets.availability.forEach(avail => {
    bulkOps.push({
      updateOne: {
        filter: { facetType: 'availability', facetKey: avail._id },
        update: {
          $set: {
            facetValue: avail._id,
            displayName: avail._id === 'in_stock' ? 'In Stock' : 'Out of Stock',
            count: avail.count,
            'cacheMetadata.lastCalculated': new Date(),
            'cacheMetadata.isStale': false
          }
        },
        upsert: true
      }
    });
  });

  if (bulkOps.length > 0) {
    await this.bulkWrite(bulkOps);
  }

  return {
    totalFacets: bulkOps.length,
    lastCalculated: new Date()
  };
};

searchFacetsSchema.statics.markStale = async function(facetTypes = []) {
  const query = {};
  if (facetTypes.length > 0) {
    query.facetType = { $in: facetTypes };
  }

  return this.updateMany(
    query,
    {
      $set: {
        'cacheMetadata.isStale': true,
        'cacheMetadata.refreshPriority': 1
      }
    }
  );
};

searchFacetsSchema.statics.getStale = async function(limit = 100) {
  return this.find({
    'cacheMetadata.isStale': true
  })
  .sort({ 'cacheMetadata.refreshPriority': -1 })
  .limit(limit)
  .lean();
};

searchFacetsSchema.statics.updatePopularity = async function(facetType, facetKey, interaction) {
  const updates = {};
  
  switch (interaction) {
    case 'click':
      updates.$inc = { 'searchContext.popularityScore': 1 };
      updates.$set = { 'searchContext.lastClicked': new Date() };
      break;
    case 'conversion':
      updates.$inc = { 'searchContext.popularityScore': 5 };
      break;
  }

  return this.findOneAndUpdate(
    { facetType, facetKey },
    updates,
    { new: true }
  );
};

searchFacetsSchema.statics.getRelatedFacets = async function(facetType, facetKey, limit = 10) {
  const facet = await this.findOne({ facetType, facetKey });
  if (!facet || !facet.relatedFacets.length) return [];

  return facet.relatedFacets
    .sort((a, b) => b.correlation - a.correlation)
    .slice(0, limit);
};

searchFacetsSchema.methods.calculateCorrelations = async function(ProductSearch) {
  const products = await ProductSearch.find({
    [`${this.facetType}.slug`]: this.facetKey
  }).lean();

  const correlations = {};

  products.forEach(product => {
    if (product.category && product.category.slug !== this.facetKey) {
      correlations[`category:${product.category.slug}`] = 
        (correlations[`category:${product.category.slug}`] || 0) + 1;
    }
    
    if (product.brand && product.brand.slug !== this.facetKey) {
      correlations[`brand:${product.brand.slug}`] = 
        (correlations[`brand:${product.brand.slug}`] || 0) + 1;
    }
    
    product.tags.forEach(tag => {
      correlations[`tag:${tag}`] = (correlations[`tag:${tag}`] || 0) + 1;
    });
  });

  const totalProducts = products.length;
  this.relatedFacets = Object.entries(correlations)
    .map(([key, count]) => {
      const [type, value] = key.split(':');
      return {
        facetType: type,
        facetKey: value,
        correlation: count / totalProducts
      };
    })
    .filter(facet => facet.correlation > 0.1)
    .sort((a, b) => b.correlation - a.correlation)
    .slice(0, 20);

  return this.save();
};

module.exports = mongoose.model('SearchFacets', searchFacetsSchema);