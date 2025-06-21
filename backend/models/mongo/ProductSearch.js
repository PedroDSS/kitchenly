const mongoose = require('mongoose');

const productSearchSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    text: true
  },
  description: {
    type: String,
    required: true,
    text: true
  },
  brand: {
    id: String,
    name: String,
    slug: String
  },
  category: {
    id: String,
    name: String,
    slug: String,
    path: [String],
    level: Number
  },
  price: {
    type: Number,
    required: true,
    index: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    index: true
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean
  }],
  attributes: [{
    name: String,
    value: mongoose.Schema.Types.Mixed,
    searchable: {
      type: Boolean,
      default: true
    }
  }],
  tags: [{
    type: String,
    index: true
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  isNew: {
    type: Boolean,
    default: false,
    index: true
  },
  discount: {
    percentage: Number,
    validUntil: Date
  },
  searchScore: {
    type: Number,
    default: 1
  },
  clickCount: {
    type: Number,
    default: 0
  },
  purchaseCount: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

productSearchSchema.index({ name: 'text', description: 'text' });
productSearchSchema.index({ 'category.id': 1, price: 1 });
productSearchSchema.index({ 'brand.id': 1, price: 1 });
productSearchSchema.index({ stock: 1, isActive: 1 });
productSearchSchema.index({ isFeatured: -1, searchScore: -1 });
productSearchSchema.index({ tags: 1 });
productSearchSchema.index({ 'attributes.name': 1, 'attributes.value': 1 });

productSearchSchema.methods.updateSearchScore = function() {
  const baseScore = 1;
  const clickWeight = 0.1;
  const purchaseWeight = 0.5;
  const ratingWeight = 0.3;
  const featuredBoost = 2;
  
  let score = baseScore;
  score += this.clickCount * clickWeight;
  score += this.purchaseCount * purchaseWeight;
  score += (this.rating.average / 5) * ratingWeight * this.rating.count;
  
  if (this.isFeatured) {
    score *= featuredBoost;
  }
  
  this.searchScore = score;
  return score;
};

productSearchSchema.statics.facetedSearch = async function(query = {}, options = {}) {
  const {
    text,
    category,
    brand,
    minPrice,
    maxPrice,
    inStock,
    tags,
    attributes,
    sort = { searchScore: -1 },
    page = 1,
    limit = 24
  } = options;

  const pipeline = [];
  const matchStage = { isActive: true };

  if (text) {
    matchStage.$text = { $search: text };
  }

  if (category) {
    matchStage['category.slug'] = category;
  }

  if (brand) {
    matchStage['brand.slug'] = brand;
  }

  if (minPrice || maxPrice) {
    matchStage.price = {};
    if (minPrice) matchStage.price.$gte = minPrice;
    if (maxPrice) matchStage.price.$lte = maxPrice;
  }

  if (inStock) {
    matchStage.stock = { $gt: 0 };
  }

  if (tags && tags.length > 0) {
    matchStage.tags = { $in: tags };
  }

  if (attributes && Object.keys(attributes).length > 0) {
    Object.entries(attributes).forEach(([name, value]) => {
      matchStage.attributes = {
        $elemMatch: { name, value }
      };
    });
  }

  pipeline.push({ $match: matchStage });

  pipeline.push({
    $facet: {
      products: [
        { $sort: sort },
        { $skip: (page - 1) * limit },
        { $limit: limit }
      ],
      totalCount: [
        { $count: 'count' }
      ],
      categoryFacets: [
        { $group: { _id: '$category.slug', count: { $sum: 1 }, name: { $first: '$category.name' } } },
        { $sort: { count: -1 } }
      ],
      brandFacets: [
        { $group: { _id: '$brand.slug', count: { $sum: 1 }, name: { $first: '$brand.name' } } },
        { $sort: { count: -1 } }
      ],
      priceFacets: [
        {
          $bucket: {
            groupBy: '$price',
            boundaries: [0, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
            default: 'other',
            output: { count: { $sum: 1 } }
          }
        }
      ],
      tagFacets: [
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]
    }
  });

  const results = await this.aggregate(pipeline);
  const facets = results[0];

  return {
    products: facets.products,
    total: facets.totalCount[0]?.count || 0,
    facets: {
      categories: facets.categoryFacets,
      brands: facets.brandFacets,
      priceRanges: facets.priceFacets,
      tags: facets.tagFacets
    },
    page,
    limit,
    totalPages: Math.ceil((facets.totalCount[0]?.count || 0) / limit)
  };
};

productSearchSchema.statics.incrementClickCount = async function(productId) {
  return this.findOneAndUpdate(
    { productId },
    { $inc: { clickCount: 1 } },
    { new: true }
  );
};

productSearchSchema.statics.incrementPurchaseCount = async function(productId, quantity = 1) {
  return this.findOneAndUpdate(
    { productId },
    { $inc: { purchaseCount: quantity } },
    { new: true }
  );
};

module.exports = mongoose.model('ProductSearch', productSearchSchema);