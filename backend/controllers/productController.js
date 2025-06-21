const { Product, Category, Brand, sequelize } = require('../models/index');
const { ProductSearch } = require('../models/mongo');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { Op } = require('sequelize');

const getPaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const buildFilterConditions = (query) => {
  const where = { isActive: true };
  
  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }
  
  if (query.brandId) {
    where.brandId = query.brandId;
  }
  
  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) where.price[Op.gte] = parseFloat(query.minPrice);
    if (query.maxPrice) where.price[Op.lte] = parseFloat(query.maxPrice);
  }
  
  if (query.inStock === 'true') {
    where.stock = { [Op.gt]: 0 };
  }
  
  if (query.search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${query.search}%` } },
      { description: { [Op.iLike]: `%${query.search}%` } },
      { SKU: { [Op.iLike]: `%${query.search}%` } }
    ];
  }
  
  return where;
};

const buildSortOrder = (sortBy) => {
  const sortOptions = {
    'price-asc': [['price', 'ASC']],
    'price-desc': [['price', 'DESC']],
    'name-asc': [['name', 'ASC']],
    'name-desc': [['name', 'DESC']],
    'newest': [['createdAt', 'DESC']],
    'popular': [['purchaseCount', 'DESC']]
  };
  
  return sortOptions[sortBy] || [['createdAt', 'DESC']];
};

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const { page, limit, offset } = getPaginationParams(req.query);
  const where = buildFilterConditions(req.query);
  const order = buildSortOrder(req.query.sortBy);
  
  const { count, rows: products } = await Product.findAndCountAll({
    where,
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      },
      {
        model: Brand,
        as: 'brand',
        attributes: ['id', 'name', 'slug', 'logo']
      }
    ],
    limit,
    offset,
    order,
    distinct: true
  });
  
  const totalPages = Math.ceil(count / limit);
  
  res.status(200).json({
    status: 'success',
    data: {
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

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({
    where: { 
      id: req.params.id,
      isActive: true
    },
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug', 'description']
      },
      {
        model: Brand,
        as: 'brand',
        attributes: ['id', 'name', 'slug', 'logo', 'description', 'website']
      }
    ]
  });
  
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  
  await ProductSearch.findOneAndUpdate(
    { productId: product.id },
    { $inc: { clickCount: 1 } }
  );
  
  res.status(200).json({
    status: 'success',
    data: { product }
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const product = await Product.create(req.body, { transaction });
    
    const productSearchData = {
      productId: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      brandId: product.brandId,
      tags: product.tags || [],
      features: product.features || {},
      specifications: product.specifications || {},
      isActive: product.isActive,
      stock: product.stock,
      searchText: `${product.name} ${product.description} ${product.SKU}`.toLowerCase()
    };
    
    await ProductSearch.create(productSearchData);
    
    await transaction.commit();
    
    const createdProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Brand, as: 'brand' }
      ]
    });
    
    res.status(201).json({
      status: 'success',
      data: { product: createdProduct }
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const product = await Product.findByPk(req.params.id, { transaction });
    
    if (!product) {
      await transaction.rollback();
      return next(new AppError('Product not found', 404));
    }
    
    await product.update(req.body, { transaction });
    
    const updateData = {
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      brandId: product.brandId,
      tags: product.tags || [],
      features: product.features || {},
      specifications: product.specifications || {},
      isActive: product.isActive,
      stock: product.stock,
      searchText: `${product.name} ${product.description} ${product.SKU}`.toLowerCase()
    };
    
    await ProductSearch.findOneAndUpdate(
      { productId: product.id },
      updateData,
      { upsert: true }
    );
    
    await transaction.commit();
    
    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Brand, as: 'brand' }
      ]
    });
    
    res.status(200).json({
      status: 'success',
      data: { product: updatedProduct }
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const product = await Product.findByPk(req.params.id, { transaction });
    
    if (!product) {
      await transaction.rollback();
      return next(new AppError('Product not found', 404));
    }
    
    await product.update({ isActive: false }, { transaction });
    
    await ProductSearch.findOneAndUpdate(
      { productId: product.id },
      { isActive: false }
    );
    
    await transaction.commit();
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

exports.searchProducts = catchAsync(async (req, res, next) => {
  const {
    q: searchQuery,
    categories,
    brands,
    minPrice,
    maxPrice,
    tags,
    inStock,
    page = 1,
    limit = 20,
    sortBy = 'relevance'
  } = req.query;
  
  const searchParams = {
    searchQuery,
    filters: {
      categories: categories ? categories.split(',') : undefined,
      brands: brands ? brands.split(',') : undefined,
      priceRange: (minPrice || maxPrice) ? { min: minPrice, max: maxPrice } : undefined,
      tags: tags ? tags.split(',') : undefined,
      inStock: inStock === 'true'
    },
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy
  };
  
  const results = await ProductSearch.facetedSearch(searchParams);
  
  res.status(200).json({
    status: 'success',
    data: results
  });
});