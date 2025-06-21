const { Product, Category, Brand, sequelize } = require('../models/index');
const { ProductSearch } = require('../models/mongo');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { Op } = require('sequelize');
const { processImmediateAlerts } = require('../cron/emailAlerts');

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
  const { page, limit } = getPaginationParams(req.query);
  
  // Build MongoDB query
  const mongoQuery = { isActive: true };
  
  if (req.query.categoryId) {
    mongoQuery['category.id'] = parseInt(req.query.categoryId);
  }
  
  if (req.query.brandId) {
    mongoQuery['brand.id'] = parseInt(req.query.brandId);
  }
  
  if (req.query.minPrice || req.query.maxPrice) {
    mongoQuery.price = {};
    if (req.query.minPrice) mongoQuery.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) mongoQuery.price.$lte = parseFloat(req.query.maxPrice);
  }
  
  if (req.query.inStock === 'true') {
    mongoQuery.stock = { $gt: 0 };
  }
  
  if (req.query.search) {
    mongoQuery.$text = { $search: req.query.search };
  }
  
  // Build sort options for MongoDB
  const sortOptions = {
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    'name-asc': { name: 1 },
    'name-desc': { name: -1 },
    'newest': { createdAt: -1 },
    'popular': { purchaseCount: -1 },
    'relevance': { searchScore: -1 }
  };
  
  const sort = sortOptions[req.query.sortBy] || { createdAt: -1 };
  
  // Execute MongoDB query with pagination
  const skip = (page - 1) * limit;
  
  const [products, totalCount] = await Promise.all([
    ProductSearch.find(mongoQuery)
      .select('-__v -searchScore -clickCount')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    ProductSearch.countDocuments(mongoQuery)
  ]);
  
  const totalPages = Math.ceil(totalCount / limit);
  
  res.status(200).json({
    status: 'success',
    data: {
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Use MongoDB for faster reads
  const productMongo = await ProductSearch.findOne({
    $and: [
      { isActive: true },
      { $or: [
        { productId: id },
        { slug: id }
      ]}
    ]
  });
  
  if (!productMongo) {
    return next(new AppError('Product not found', 404));
  }
  
  // Increment click count
  await ProductSearch.findOneAndUpdate(
    { productId: productMongo.productId },
    { $inc: { clickCount: 1 } }
  );
  
  // Transform MongoDB document to match expected format
  const product = {
    id: productMongo.productId,
    name: productMongo.name,
    slug: productMongo.slug || productMongo.name.toLowerCase().replace(/\s+/g, '-'),
    description: productMongo.description,
    shortDescription: productMongo.shortDescription,
    price: productMongo.price,
    compareAtPrice: productMongo.compareAtPrice,
    stock: productMongo.stock,
    sku: productMongo.sku,
    images: productMongo.images || [],
    mainImage: productMongo.images?.[0]?.url || null,
    category: productMongo.category,
    brand: productMongo.brand,
    weight: productMongo.weight,
    dimensions: productMongo.dimensions,
    features: productMongo.attributes?.filter(a => a.name === 'feature').map(a => a.value) || [],
    specifications: productMongo.attributes?.reduce((specs, attr) => {
      if (attr.name !== 'feature') {
        specs[attr.name] = attr.value;
      }
      return specs;
    }, {}) || {},
    tags: productMongo.tags || [],
    isActive: productMongo.isActive,
    isFeatured: productMongo.isFeatured,
    viewCount: productMongo.clickCount,
    salesCount: productMongo.purchaseCount,
    rating: productMongo.rating?.average || 0,
    reviewCount: productMongo.rating?.count || 0
  };
  
  res.status(200).json({
    status: 'success',
    data: { product }
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const product = await Product.create(req.body, { transaction });
    
    // Get category and brand data for denormalization
    const [category, brand] = await Promise.all([
      product.categoryId ? Category.findByPk(product.categoryId, {
        attributes: ['id', 'name', 'slug']
      }) : null,
      product.brandId ? Brand.findByPk(product.brandId, {
        attributes: ['id', 'name', 'slug']
      }) : null
    ]);
    
    const productSearchData = {
      productId: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: category ? {
        id: category.id,
        name: category.name,
        slug: category.slug
      } : null,
      brand: brand ? {
        id: brand.id,
        name: brand.name,
        slug: brand.slug
      } : null,
      tags: product.tags || [],
      attributes: product.features ? Object.entries(product.features).map(([name, value]) => ({ name, value })) : [],
      isActive: product.isActive,
      stock: product.stock,
      images: product.images || []
    };
    
    await ProductSearch.create(productSearchData);
    
    await transaction.commit();
    
    const createdProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Brand, as: 'brand' }
      ]
    });
    
    // Process email alerts for new products
    await processImmediateAlerts('product_created', {
      productId: product.id,
      product: createdProduct,
      categoryId: product.categoryId,
      categoryPath: [] // This would need to be populated if using hierarchical categories
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
    
    // Store old values for alert processing
    const oldPrice = product.price;
    const oldStock = product.stock;
    
    await product.update(req.body, { transaction });
    
    // Get category and brand data for denormalization
    const [category, brand] = await Promise.all([
      product.categoryId ? Category.findByPk(product.categoryId, {
        attributes: ['id', 'name', 'slug']
      }) : null,
      product.brandId ? Brand.findByPk(product.brandId, {
        attributes: ['id', 'name', 'slug']
      }) : null
    ]);
    
    const updateData = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: category ? {
        id: category.id,
        name: category.name,
        slug: category.slug
      } : null,
      brand: brand ? {
        id: brand.id,
        name: brand.name,
        slug: brand.slug
      } : null,
      tags: product.tags || [],
      attributes: product.features ? Object.entries(product.features).map(([name, value]) => ({ name, value })) : [],
      isActive: product.isActive,
      stock: product.stock,
      images: product.images || [],
      lastUpdated: new Date()
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
    
    // Process email alerts for price and stock changes
    if (oldPrice !== product.price) {
      await processImmediateAlerts('price_changed', {
        productId: product.id,
        product: updatedProduct,
        oldPrice,
        newPrice: product.price
      });
    }
    
    if (oldStock !== product.stock) {
      await processImmediateAlerts('stock_changed', {
        productId: product.id,
        product: updatedProduct,
        oldStock,
        newStock: product.stock
      });
    }
    
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
    q: text,
    category,
    brand,
    minPrice,
    maxPrice,
    tags,
    inStock,
    page = 1,
    limit = 20,
    sortBy = 'relevance'
  } = req.query;
  
  // Build sort object
  const sortOptions = {
    'relevance': { searchScore: -1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    'name-asc': { name: 1 },
    'name-desc': { name: -1 },
    'newest': { createdAt: -1 },
    'popular': { purchaseCount: -1 }
  };
  
  const options = {
    text,
    category,
    brand,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    tags: tags ? tags.split(',') : undefined,
    inStock: inStock === 'true',
    sort: sortOptions[sortBy] || { searchScore: -1 },
    page: parseInt(page),
    limit: parseInt(limit)
  };
  
  const results = await ProductSearch.facetedSearch({}, options);
  
  res.status(200).json({
    status: 'success',
    data: results
  });
});