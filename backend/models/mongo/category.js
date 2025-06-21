const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  categoryId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description: String,
  parentId: {
    type: String,
    index: true
  },
  level: {
    type: Number,
    default: 0,
    index: true
  },
  path: [{
    id: String,
    name: String,
    slug: String
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  productCount: {
    type: Number,
    default: 0
  },
  children: [{
    id: String,
    name: String,
    slug: String,
    productCount: Number
  }]
}, {
  timestamps: true
});

categorySchema.index({ parentId: 1, displayOrder: 1 });
categorySchema.index({ level: 1, isActive: 1 });

module.exports = mongoose.model('Category', categorySchema);