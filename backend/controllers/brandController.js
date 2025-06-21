const { Brand, Product } = require('../models/index');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { Op } = require('sequelize');

exports.getAllBrands = catchAsync(async (req, res, next) => {
  const { includeInactive = 'false', withProductCount = 'false' } = req.query;
  
  const where = {};
  if (includeInactive !== 'true') {
    where.isActive = true;
  }
  
  const attributes = [
    'id', 'name', 'slug', 'description', 'logo',
    'website', 'country', 'displayOrder', 'isActive'
  ];
  
  if (withProductCount === 'true') {
    attributes.push([
      require('sequelize').literal(
        '(SELECT COUNT(*) FROM "Products" WHERE "Products"."brandId" = "Brand"."id" AND "Products"."isActive" = true)'
      ),
      'productCount'
    ]);
  }
  
  const brands = await Brand.findAll({
    where,
    attributes,
    order: [['displayOrder', 'ASC'], ['name', 'ASC']]
  });
  
  res.status(200).json({
    status: 'success',
    data: { brands }
  });
});

exports.getBrand = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { includeProducts = 'false' } = req.query;
  
  const brand = await Brand.findOne({
    where: { 
      [Op.or]: [
        { id: id },
        { slug: id }
      ],
      isActive: true
    }
  });
  
  if (!brand) {
    return next(new AppError('Brand not found', 404));
  }
  
  const result = brand.toJSON();
  
  if (includeProducts === 'true') {
    const products = await Product.findAll({
      where: { 
        brandId: brand.id,
        isActive: true
      },
      limit: 20,
      order: [['createdAt', 'DESC']]
    });
    result.products = products;
  }
  
  const productCount = await Product.count({
    where: { 
      brandId: brand.id,
      isActive: true
    }
  });
  result.productCount = productCount;
  
  res.status(200).json({
    status: 'success',
    data: { brand: result }
  });
});

exports.getBrandProducts = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  
  const brand = await Brand.findOne({
    where: { 
      [Op.or]: [
        { id: id },
        { slug: id }
      ],
      isActive: true
    }
  });
  
  if (!brand) {
    return next(new AppError('Brand not found', 404));
  }
  
  const where = {
    brandId: brand.id,
    isActive: true
  };
  
  if (req.query.categoryId) {
    where.categoryId = req.query.categoryId;
  }
  
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
    order: [['createdAt', 'DESC']],
    include: [{
      model: require('../models/postgres/Category'),
      as: 'category',
      attributes: ['id', 'name', 'slug']
    }]
  });
  
  const totalPages = Math.ceil(count / limit);
  
  res.status(200).json({
    status: 'success',
    data: {
      brand,
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

exports.createBrand = catchAsync(async (req, res, next) => {
  const brand = await Brand.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: { brand }
  });
});

exports.updateBrand = catchAsync(async (req, res, next) => {
  const brand = await Brand.findByPk(req.params.id);
  
  if (!brand) {
    return next(new AppError('Brand not found', 404));
  }
  
  await brand.update(req.body);
  
  res.status(200).json({
    status: 'success',
    data: { brand }
  });
});

exports.deleteBrand = catchAsync(async (req, res, next) => {
  const brand = await Brand.findByPk(req.params.id);
  
  if (!brand) {
    return next(new AppError('Brand not found', 404));
  }
  
  const hasProducts = await Product.count({
    where: { brandId: brand.id }
  });
  
  if (hasProducts > 0) {
    return next(new AppError('Cannot delete brand with associated products', 400));
  }
  
  await brand.update({ isActive: false });
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});