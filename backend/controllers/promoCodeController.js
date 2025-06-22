const { PromoCode, Order, User, Category, Product, sequelize } = require('../models');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const getPromoCodes = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    search = '',
    status = '',
    type = '',
    sort = '-createdAt'
  } = req.query;

  const offset = (page - 1) * limit;
  const where = {};

  // Search by code or description
  if (search) {
    where[Op.or] = [
      { code: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } }
    ];
  }

  // Filter by status
  if (status === 'active') {
    where.isActive = true;
    where.validFrom = { [Op.lte]: new Date() };
    where[Op.or] = [
      { expiresAt: null },
      { expiresAt: { [Op.gte]: new Date() } }
    ];
  } else if (status === 'expired') {
    where.expiresAt = { [Op.lt]: new Date() };
  } else if (status === 'inactive') {
    where.isActive = false;
  }

  // Filter by type
  if (type) {
    where.type = type;
  }

  // Parse sort parameter
  const order = [];
  if (sort.startsWith('-')) {
    order.push([sort.substring(1), 'DESC']);
  } else {
    order.push([sort, 'ASC']);
  }

  const { count, rows: promoCodes } = await PromoCode.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset,
    order,
    include: [
      {
        model: Category,
        attributes: ['id', 'name']
      },
      {
        model: Product,
        attributes: ['id', 'name']
      }
    ]
  });

  // Add computed fields
  const promoCodesWithStats = promoCodes.map(promo => {
    const promoJSON = promo.toJSON();
    return {
      ...promoJSON,
      remainingUses: promo.maxUses ? promo.maxUses - promo.usageCount : null,
      isExpired: promo.expiresAt && new Date(promo.expiresAt) < new Date(),
      isValid: promo.isValid()
    };
  });

  res.status(200).json({
    status: 'success',
    data: {
      promoCodes: promoCodesWithStats,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        perPage: parseInt(limit)
      }
    }
  });
});

const getPromoCode = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const promoCode = await PromoCode.findByPk(id, {
    include: [
      {
        model: Category,
        attributes: ['id', 'name']
      },
      {
        model: Product,
        attributes: ['id', 'name']
      },
      {
        model: Order,
        attributes: ['id', 'totalAmount', 'createdAt'],
        include: [{
          model: User,
          attributes: ['id', 'email', 'firstName', 'lastName']
        }],
        limit: 10,
        order: [['createdAt', 'DESC']]
      }
    ]
  });

  if (!promoCode) {
    return next(new AppError('Promo code not found', 404));
  }

  // Get usage statistics
  const usageStats = await Order.findAll({
    where: { promoCodeId: id },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalUses'],
      [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalRevenue'],
      [sequelize.fn('AVG', sequelize.col('totalAmount')), 'avgOrderValue']
    ],
    raw: true
  });

  const userUsage = await Order.findAll({
    where: { promoCodeId: id },
    attributes: [
      'userId',
      [sequelize.fn('COUNT', sequelize.col('id')), 'uses']
    ],
    group: ['userId'],
    include: [{
      model: User,
      attributes: ['email', 'firstName', 'lastName']
    }]
  });

  res.status(200).json({
    status: 'success',
    data: {
      promoCode: {
        ...promoCode.toJSON(),
        stats: usageStats[0],
        userUsage
      }
    }
  });
});

const createPromoCode = catchAsync(async (req, res, next) => {
  const {
    code,
    description,
    type,
    discount,
    minimumAmount,
    maxUses,
    maxUsesPerUser,
    categoryId,
    productId,
    userRestrictions,
    validFrom,
    expiresAt,
    isActive
  } = req.body;

  // Validate discount value
  if (type === 'percentage' && discount > 100) {
    return next(new AppError('Percentage discount cannot exceed 100', 400));
  }

  if (discount <= 0) {
    return next(new AppError('Discount must be greater than 0', 400));
  }

  // Check if code already exists
  const existingCode = await PromoCode.findOne({
    where: { code: code.toUpperCase() }
  });

  if (existingCode) {
    return next(new AppError('Promo code already exists', 400));
  }

  // Validate category/product if provided
  if (categoryId) {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return next(new AppError('Category not found', 404));
    }
  }

  if (productId) {
    const product = await Product.findByPk(productId);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }
  }

  const promoCode = await PromoCode.create({
    code,
    description,
    type,
    discount,
    minimumAmount,
    maxUses,
    maxUsesPerUser,
    categoryId,
    productId,
    userRestrictions: userRestrictions || [],
    validFrom: validFrom || new Date(),
    expiresAt,
    isActive: isActive !== undefined ? isActive : true
  });

  const createdPromo = await PromoCode.findByPk(promoCode.id, {
    include: [
      { model: Category, attributes: ['id', 'name'] },
      { model: Product, attributes: ['id', 'name'] }
    ]
  });

  logger.info(`Promo code ${code} created by user ${req.user.id}`);

  res.status(201).json({
    status: 'success',
    data: { promoCode: createdPromo }
  });
});

const updatePromoCode = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  const promoCode = await PromoCode.findByPk(id);

  if (!promoCode) {
    return next(new AppError('Promo code not found', 404));
  }

  // Validate updates
  if (updates.type === 'percentage' && updates.discount > 100) {
    return next(new AppError('Percentage discount cannot exceed 100', 400));
  }

  if (updates.discount !== undefined && updates.discount <= 0) {
    return next(new AppError('Discount must be greater than 0', 400));
  }

  // Validate category/product if provided
  if (updates.categoryId) {
    const category = await Category.findByPk(updates.categoryId);
    if (!category) {
      return next(new AppError('Category not found', 404));
    }
  }

  if (updates.productId) {
    const product = await Product.findByPk(updates.productId);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }
  }

  // Don't allow code change if already used
  if (updates.code && updates.code !== promoCode.code && promoCode.usageCount > 0) {
    return next(new AppError('Cannot change code after it has been used', 400));
  }

  await promoCode.update(updates);

  const updatedPromo = await PromoCode.findByPk(id, {
    include: [
      { model: Category, attributes: ['id', 'name'] },
      { model: Product, attributes: ['id', 'name'] }
    ]
  });

  logger.info(`Promo code ${promoCode.code} updated by user ${req.user.id}`);

  res.status(200).json({
    status: 'success',
    data: { promoCode: updatedPromo }
  });
});

const deletePromoCode = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const promoCode = await PromoCode.findByPk(id);

  if (!promoCode) {
    return next(new AppError('Promo code not found', 404));
  }

  // Don't allow deletion if used
  if (promoCode.usageCount > 0) {
    return next(new AppError('Cannot delete promo code that has been used. Deactivate it instead.', 400));
  }

  await promoCode.destroy();

  logger.info(`Promo code ${promoCode.code} deleted by user ${req.user.id}`);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

const validatePromoCode = catchAsync(async (req, res, next) => {
  const { code, items, userId } = req.body;

  if (!code) {
    return next(new AppError('Promo code is required', 400));
  }

  const promoCode = await PromoCode.findOne({
    where: { code: code.toUpperCase() }
  });

  if (!promoCode) {
    return next(new AppError('Invalid promo code', 404));
  }

  // Check if promo code is valid
  if (!promoCode.isValid()) {
    return next(new AppError('Promo code is expired or inactive', 400));
  }

  // Check user restrictions
  if (userId && !promoCode.canBeUsedBy(userId)) {
    return next(new AppError('You have reached the maximum uses for this promo code', 400));
  }

  // Check if applicable to items
  if (items && !promoCode.canBeAppliedTo(items)) {
    return next(new AppError('Promo code is not applicable to these items', 400));
  }

  // Calculate subtotal if items provided
  let subtotal = 0;
  if (items) {
    subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  // Check minimum amount
  if (subtotal > 0 && subtotal < promoCode.minimumAmount) {
    return next(new AppError(`Minimum order amount of ${promoCode.minimumAmount}€ required`, 400));
  }

  const discount = promoCode.calculateDiscount(subtotal);

  res.status(200).json({
    status: 'success',
    data: {
      valid: true,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        description: promoCode.description,
        type: promoCode.type,
        discount: promoCode.discount,
        minimumAmount: promoCode.minimumAmount
      },
      discountAmount: discount
    }
  });
});

const getPromoCodeAnalytics = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { period = '30d' } = req.query;

  let startDate;
  const endDate = new Date();

  switch (period) {
    case '7d':
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  const promoCode = await PromoCode.findByPk(id);
  if (!promoCode) {
    return next(new AppError('Promo code not found', 404));
  }

  // Get usage over time
  const usageByDay = await Order.findAll({
    where: {
      promoCodeId: id,
      createdAt: { [Op.between]: [startDate, endDate] }
    },
    attributes: [
      [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'uses'],
      [sequelize.fn('SUM', sequelize.col('totalAmount')), 'revenue']
    ],
    group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
    order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
    raw: true
  });

  // Get user demographics
  const userDemographics = await Order.findAll({
    where: {
      promoCodeId: id,
      createdAt: { [Op.between]: [startDate, endDate] }
    },
    include: [{
      model: User,
      attributes: ['id', 'createdAt']
    }],
    attributes: [
      [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('Order.userId'))), 'uniqueUsers']
    ],
    raw: true
  });

  // Get product performance with this promo
  const productPerformance = await sequelize.query(`
    SELECT 
      p.id,
      p.name,
      COUNT(DISTINCT o.id) as orders,
      SUM(oi.quantity) as units_sold,
      SUM(oi.quantity * oi.unit_price) as revenue
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE o.promo_code_id = :promoCodeId
      AND o.created_at BETWEEN :startDate AND :endDate
    GROUP BY p.id, p.name
    ORDER BY revenue DESC
    LIMIT 10
  `, {
    replacements: { promoCodeId: id, startDate, endDate },
    type: sequelize.QueryTypes.SELECT
  });

  res.status(200).json({
    status: 'success',
    data: {
      period,
      startDate,
      endDate,
      analytics: {
        usageByDay,
        userDemographics: userDemographics[0],
        productPerformance,
        totalDiscountGiven: usageByDay.reduce((sum, day) => {
          const revenue = parseFloat(day.revenue);
          const discountAmount = promoCode.type === 'percentage' 
            ? revenue * (promoCode.discount / 100)
            : promoCode.discount * day.uses;
          return sum + discountAmount;
        }, 0)
      }
    }
  });
});

module.exports = {
  getPromoCodes,
  getPromoCode,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  validatePromoCode,
  getPromoCodeAnalytics
};