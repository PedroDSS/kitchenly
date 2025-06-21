const { Category, Product } = require('../models/index');
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
  
  const where = {};
  if (includeInactive !== 'true') {
    where.isActive = true;
  }
  
  const categories = await Category.findAll({
    where,
    order: [['displayOrder', 'ASC'], ['name', 'ASC']],
    attributes: [
      'id', 'name', 'slug', 'description', 'image', 'icon',
      'parentId', 'displayOrder', 'isActive', 'metaTitle', 'metaDescription'
    ]
  });
  
  let data = categories;
  
  if (tree === 'true') {
    data = buildCategoryTree(categories);
  }
  
  res.status(200).json({
    status: 'success',
    data: { categories: data }
  });
});

exports.getCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { includeProducts = 'false', includeAncestors = 'false', includeDescendants = 'false' } = req.query;
  
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
  
  const result = category.toJSON();
  
  if (includeAncestors === 'true') {
    result.ancestors = await category.getAncestors();
  }
  
  if (includeDescendants === 'true') {
    result.descendants = await category.getDescendants();
  }
  
  if (includeProducts === 'true') {
    const products = await Product.findAll({
      where: { 
        categoryId: category.id,
        isActive: true
      },
      limit: 20,
      order: [['createdAt', 'DESC']]
    });
    result.products = products;
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