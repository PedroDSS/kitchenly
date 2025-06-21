const { Category, Product } = require('../models/index');
const CategoryMongo = require('../models/mongo/category');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { Op } = require('sequelize');

const buildCategoryTree = (categories, parentId = null) => {
  return categories
    .filter(cat => cat.parentId === parentId)
    .map(cat => ({
      ...cat.toJSON(),
      children: buildCategoryTree(categories, cat.id)
    }));
};

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const { tree = 'false', includeInactive = 'false' } = req.query;
  
  const filter = {};
  if (includeInactive !== 'true') {
    filter.isActive = true;
  }
  
  // Use MongoDB for faster reads
  const categories = await CategoryMongo.find(filter)
    .sort({ displayOrder: 1, name: 1 })
    .select('-_id -__v');
  
  let data = categories;
  
  if (tree === 'true') {
    // Convert MongoDB documents to plain objects for tree building
    const plainCategories = categories.map(cat => ({
      ...cat.toObject(),
      id: cat.categoryId,
      toJSON: () => cat.toObject()
    }));
    data = buildCategoryTree(plainCategories);
  }
  
  res.status(200).json({
    status: 'success',
    data: { categories: data }
  });
});

exports.getCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { includeProducts = 'false', includeAncestors = 'false', includeDescendants = 'false' } = req.query;
  
  // Try to find by ID or slug in MongoDB
  const category = await CategoryMongo.findOne({
    $and: [
      { isActive: true },
      { $or: [
        { categoryId: id },
        { slug: id }
      ]}
    ]
  });
  
  if (!category) {
    return next(new AppError('Category not found', 404));
  }
  
  const result = category.toObject();
  result.id = result.categoryId;
  delete result._id;
  delete result.__v;
  delete result.categoryId;
  
  if (includeAncestors === 'true') {
    result.ancestors = result.path || [];
  }
  
  if (includeDescendants === 'true') {
    result.descendants = result.children || [];
  }
  
  if (includeProducts === 'true') {
    // For products, we still need to query PostgreSQL or use ProductSearch
    const ProductSearch = require('../models/mongo/ProductSearch');
    const products = await ProductSearch.find({
      'category.id': category.categoryId,
      isActive: true
    })
    .limit(20)
    .sort({ createdAt: -1 })
    .select('-_id -__v');
    
    result.products = products.map(p => ({
      id: p.productId,
      name: p.name,
      slug: p.slug,
      price: p.price,
      stock: p.stock,
      mainImage: p.images?.[0]?.url || null,
      rating: p.rating,
      isFeatured: p.isFeatured
    }));
  }
  
  res.status(200).json({
    status: 'success',
    data: { category: result }
  });
});

exports.getCategoryProducts = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  
  const category = await Category.findOne({
    where: { 
      [Op.or]: [
        { id: id },
        { slug: id }
      ],
      isActive: true
    }
  });
  
  if (!category) {
    return next(new AppError('Category not found', 404));
  }
  
  const includeDescendants = req.query.includeDescendants === 'true';
  let categoryIds = [category.id];
  
  if (includeDescendants) {
    const descendants = await category.getDescendants();
    categoryIds = [...categoryIds, ...descendants.map(d => d.id)];
  }
  
  const where = {
    categoryId: { [Op.in]: categoryIds },
    isActive: true
  };
  
  if (req.query.minPrice || req.query.maxPrice) {
    where.price = {};
    if (req.query.minPrice) where.price[Op.gte] = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) where.price[Op.lte] = parseFloat(req.query.maxPrice);
  }
  
  if (req.query.inStock === 'true') {
    where.stock = { [Op.gt]: 0 };
  }
  
  const { count, rows: products } = await Product.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });
  
  const totalPages = Math.ceil(count / limit);
  
  res.status(200).json({
    status: 'success',
    data: {
      category,
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  });
});

exports.createCategory = catchAsync(async (req, res, next) => {
  const category = await Category.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: { category }
  });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByPk(req.params.id);
  
  if (!category) {
    return next(new AppError('Category not found', 404));
  }
  
  if (req.body.parentId === category.id) {
    return next(new AppError('Category cannot be its own parent', 400));
  }
  
  if (req.body.parentId) {
    const descendants = await category.getDescendants();
    const descendantIds = descendants.map(d => d.id);
    
    if (descendantIds.includes(req.body.parentId)) {
      return next(new AppError('Cannot set descendant as parent (circular reference)', 400));
    }
  }
  
  await category.update(req.body);
  
  res.status(200).json({
    status: 'success',
    data: { category }
  });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByPk(req.params.id);
  
  if (!category) {
    return next(new AppError('Category not found', 404));
  }
  
  const hasProducts = await Product.count({
    where: { categoryId: category.id }
  });
  
  if (hasProducts > 0) {
    return next(new AppError('Cannot delete category with associated products', 400));
  }
  
  const hasChildren = await Category.count({
    where: { parentId: category.id }
  });
  
  if (hasChildren > 0) {
    return next(new AppError('Cannot delete category with subcategories', 400));
  }
  
  await category.update({ isActive: false });
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});