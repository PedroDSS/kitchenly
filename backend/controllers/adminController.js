const { User, Order, OrderItem, Product, Category, Brand, StockMovement, PaymentTransaction, Cart, sequelize, Sequelize } = require('../models');
const { DashboardMetrics, UserActivity } = require('../models/mongo');
const AppError = require('../utils/appError');
const { Op } = Sequelize;
const logger = require('../utils/logger');
const { signToken } = require('../middleware/auth');

const getDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Get metrics from MongoDB if available
    let cachedMetrics = await DashboardMetrics.findOne({
      date: { $gte: today }
    });

    if (!cachedMetrics) {
      // Calculate metrics if not cached
      const [
        totalUsers,
        newUsersToday,
        totalOrders,
        ordersToday,
        totalRevenue,
        revenueToday,
        revenueThisMonth,
        revenueLastMonth,
        pendingOrders,
        processingOrders,
        lowStockProducts,
        outOfStockProducts
      ] = await Promise.all([
        User.count(),
        User.count({ where: { createdAt: { [Op.gte]: today } } }),
        Order.count(),
        Order.count({ where: { createdAt: { [Op.gte]: today } } }),
        Order.sum('totalAmount') || 0,
        Order.sum('totalAmount', { where: { createdAt: { [Op.gte]: today } } }) || 0,
        Order.sum('totalAmount', { where: { createdAt: { [Op.gte]: startOfMonth } } }) || 0,
        Order.sum('totalAmount', { 
          where: { 
            createdAt: { 
              [Op.gte]: startOfLastMonth,
              [Op.lte]: endOfLastMonth 
            } 
          } 
        }) || 0,
        Order.count({ where: { status: 'pending' } }),
        Order.count({ where: { status: 'processing' } }),
        Product.count({ where: { stock: { [Op.gt]: 0, [Op.lte]: 10 } } }),
        Product.count({ where: { stock: 0 } })
      ]);

      // Get recent activities
      const recentActivities = await UserActivity.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .populate('userId', 'firstName lastName email');

      // Get top selling products
      const topProducts = await Order.findAll({
        include: [{
          model: OrderItem,
          attributes: ['productId', 'quantity'],
          include: [{
            model: Product,
            attributes: ['name', 'price']
          }]
        }],
        where: {
          createdAt: { [Op.gte]: startOfMonth }
        },
        attributes: [],
        group: ['OrderItems.productId', 'OrderItems.Product.id'],
        order: [[Sequelize.fn('SUM', Sequelize.col('OrderItems.quantity')), 'DESC']],
        limit: 5,
        raw: true
      });

      const metrics = {
        users: {
          total: totalUsers,
          newToday: newUsersToday
        },
        orders: {
          total: totalOrders,
          today: ordersToday,
          pending: pendingOrders,
          processing: processingOrders
        },
        revenue: {
          total: totalRevenue,
          today: revenueToday,
          thisMonth: revenueThisMonth,
          lastMonth: revenueLastMonth,
          monthOverMonth: revenueLastMonth > 0 
            ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(2)
            : 0
        },
        inventory: {
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts
        },
        topProducts,
        recentActivities
      };

      // Cache metrics
      await DashboardMetrics.create({
        date: today,
        metrics,
        expiresAt: new Date(Date.now() + 3600000) // 1 hour
      });

      cachedMetrics = { metrics };
    }

    res.status(200).json({
      status: 'success',
      data: cachedMetrics.metrics
    });
  } catch (error) {
    logger.error('Admin dashboard error:', error);
    return next(new AppError('Error fetching dashboard metrics', 500));
  }
};

const getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      role = '',
      status = '',
      sort = '-createdAt'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Search by name or email
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filter by role
    if (role) {
      where.roles = { [Op.contains]: [role] };
    }

    // Filter by status
    if (status === 'active') {
      where.isEmailConfirmed = true;
      where.accountLockedUntil = null;
    } else if (status === 'locked') {
      where.accountLockedUntil = { [Op.gt]: new Date() };
    } else if (status === 'unconfirmed') {
      where.isEmailConfirmed = false;
    }

    // Parse sort parameter
    const order = [];
    if (sort.startsWith('-')) {
      order.push([sort.substring(1), 'DESC']);
    } else {
      order.push([sort, 'ASC']);
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order,
      attributes: { exclude: ['password', 'confirmationToken', 'resetToken'] }
    });

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          total: count,
          pages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          perPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Admin users list error:', error);
    return next(new AppError('Error fetching users', 500));
  }
};

const loginAsUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return next(new AppError('User not found', 404));
    }

    // Log the impersonation action
    await UserActivity.create({
      userId: req.user.id,
      action: 'admin_impersonation',
      details: {
        targetUserId: userId,
        targetUserEmail: targetUser.email,
        adminEmail: req.user.email
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    logger.warn(`Admin ${req.user.email} impersonating user ${targetUser.email}`);

    // Generate token for the target user
    const token = signToken(targetUser.id);

    res.status(200).json({
      status: 'success',
      data: {
        token,
        user: {
          id: targetUser.id,
          email: targetUser.email,
          firstName: targetUser.firstName,
          lastName: targetUser.lastName,
          roles: targetUser.roles,
          impersonatedBy: {
            id: req.user.id,
            email: req.user.email
          }
        }
      }
    });
  } catch (error) {
    logger.error('Admin login-as error:', error);
    return next(new AppError('Error impersonating user', 500));
  }
};

const getOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = '',
      dateFrom = '',
      dateTo = '',
      minAmount = '',
      maxAmount = '',
      userId = '',
      sort = '-createdAt'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt[Op.gte] = new Date(dateFrom);
      if (dateTo) where.createdAt[Op.lte] = new Date(dateTo);
    }

    if (minAmount || maxAmount) {
      where.totalAmount = {};
      if (minAmount) where.totalAmount[Op.gte] = parseFloat(minAmount);
      if (maxAmount) where.totalAmount[Op.lte] = parseFloat(maxAmount);
    }

    if (userId) {
      where.userId = userId;
    }

    // Parse sort parameter
    const order = [];
    if (sort.startsWith('-')) {
      order.push([sort.substring(1), 'DESC']);
    } else {
      order.push([sort, 'ASC']);
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order,
      include: [
        {
          model: User,
          attributes: ['id', 'email', 'firstName', 'lastName']
        },
        {
          model: PaymentTransaction,
          attributes: ['id', 'status', 'amount', 'stripeId']
        }
      ]
    });

    res.status(200).json({
      status: 'success',
      data: {
        orders,
        pagination: {
          total: count,
          pages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          perPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Admin orders list error:', error);
    return next(new AppError('Error fetching orders', 500));
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid order status', 400));
    }

    const order = await Order.findByPk(id, {
      include: [User, OrderItem]
    });

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    const previousStatus = order.status;
    order.status = status;
    
    if (note) {
      order.adminNotes = order.adminNotes || [];
      order.adminNotes.push({
        note,
        adminId: req.user.id,
        adminEmail: req.user.email,
        timestamp: new Date(),
        previousStatus,
        newStatus: status
      });
    }

    await order.save();

    // Log the status change
    await UserActivity.create({
      userId: req.user.id,
      action: 'order_status_change',
      details: {
        orderId: id,
        previousStatus,
        newStatus: status,
        note
      }
    });

    // If cancelled, restore stock
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      for (const item of order.OrderItems) {
        await Product.increment('stock', {
          by: item.quantity,
          where: { id: item.productId }
        });

        await StockMovement.create({
          productId: item.productId,
          quantity: item.quantity,
          type: 'in',
          reason: `Order #${order.id} cancelled`,
          userId: req.user.id
        });
      }
    }

    res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    logger.error('Admin order status update error:', error);
    return next(new AppError('Error updating order status', 500));
  }
};

const getStock = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category = '',
      brand = '',
      stockStatus = '',
      sort = 'name'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};
    const include = [];

    if (category) {
      include.push({
        model: Category,
        where: { id: category },
        attributes: ['id', 'name']
      });
    }

    if (brand) {
      include.push({
        model: Brand,
        where: { id: brand },
        attributes: ['id', 'name']
      });
    }

    if (stockStatus === 'out') {
      where.stock = 0;
    } else if (stockStatus === 'low') {
      where.stock = { [Op.gt]: 0, [Op.lte]: 10 };
    } else if (stockStatus === 'normal') {
      where.stock = { [Op.gt]: 10 };
    }

    // Parse sort parameter
    const order = [];
    if (sort.startsWith('-')) {
      order.push([sort.substring(1), 'DESC']);
    } else {
      order.push([sort, 'ASC']);
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset,
      order,
      attributes: ['id', 'name', 'sku', 'stock', 'price', 'updatedAt']
    });

    // Get recent stock movements
    const recentMovements = await StockMovement.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10,
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'sku']
        },
        {
          model: User,
          attributes: ['id', 'email', 'firstName', 'lastName']
        }
      ]
    });

    res.status(200).json({
      status: 'success',
      data: {
        products,
        recentMovements,
        pagination: {
          total: count,
          pages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          perPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Admin stock overview error:', error);
    return next(new AppError('Error fetching stock data', 500));
  }
};

const createStockMovement = async (req, res, next) => {
  try {
    const { productId, quantity, type, reason } = req.body;

    if (!productId || !quantity || !type || !reason) {
      return next(new AppError('Missing required fields', 400));
    }

    if (!['in', 'out', 'adjustment'].includes(type)) {
      return next(new AppError('Invalid movement type', 400));
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Check if we have enough stock for 'out' movements
    if (type === 'out' && product.stock < quantity) {
      return next(new AppError('Insufficient stock', 400));
    }

    // Update product stock
    const stockChange = type === 'in' ? quantity : -quantity;
    product.stock += stockChange;
    
    if (product.stock < 0) {
      product.stock = 0;
    }
    
    await product.save();

    // Create stock movement record
    const movement = await StockMovement.create({
      productId,
      quantity,
      type,
      reason,
      userId: req.user.id,
      previousStock: product.stock - stockChange,
      newStock: product.stock
    });

    // Log the action
    await UserActivity.create({
      userId: req.user.id,
      action: 'stock_movement',
      details: {
        productId,
        productName: product.name,
        type,
        quantity,
        reason,
        previousStock: movement.previousStock,
        newStock: movement.newStock
      }
    });

    res.status(201).json({
      status: 'success',
      data: { movement }
    });
  } catch (error) {
    logger.error('Admin stock movement error:', error);
    return next(new AppError('Error creating stock movement', 500));
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const { period = '7d', metrics = 'all' } = req.query;

    let startDate;
    const endDate = new Date();

    switch (period) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
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
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    const analyticsData = {};

    // Sales analytics
    if (metrics === 'all' || metrics === 'sales') {
      const salesByDay = await Order.findAll({
        attributes: [
          [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'orderCount'],
          [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'revenue']
        ],
        where: {
          createdAt: { [Op.between]: [startDate, endDate] },
          status: { [Op.notIn]: ['cancelled', 'refunded'] }
        },
        group: [Sequelize.fn('DATE', Sequelize.col('createdAt'))],
        order: [[Sequelize.fn('DATE', Sequelize.col('createdAt')), 'ASC']]
      });

      analyticsData.sales = salesByDay;
    }

    // User analytics
    if (metrics === 'all' || metrics === 'users') {
      const userActivity = await UserActivity.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              action: '$action'
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.date': 1 }
        }
      ]);

      analyticsData.userActivity = userActivity;
    }

    // Product performance
    if (metrics === 'all' || metrics === 'products') {
      const topSellingProducts = await OrderItem.findAll({
        attributes: [
          'productId',
          [Sequelize.fn('SUM', Sequelize.col('quantity')), 'totalSold'],
          [Sequelize.fn('SUM', Sequelize.col('unitPrice')), 'totalRevenue']
        ],
        include: [
          {
            model: Product,
            attributes: ['name', 'sku']
          },
          {
            model: Order,
            attributes: [],
            where: {
              createdAt: { [Op.between]: [startDate, endDate] },
              status: { [Op.notIn]: ['cancelled', 'refunded'] }
            }
          }
        ],
        group: ['productId', 'Product.id'],
        order: [[Sequelize.fn('SUM', Sequelize.col('quantity')), 'DESC']],
        limit: 10
      });

      analyticsData.topProducts = topSellingProducts;
    }

    // Conversion funnel
    if (metrics === 'all' || metrics === 'conversion') {
      const [visitors, cartsCreated, ordersPlaced, ordersCompleted] = await Promise.all([
        UserActivity.countDocuments({
          action: 'page_view',
          timestamp: { $gte: startDate, $lte: endDate }
        }),
        Cart.count({
          where: { createdAt: { [Op.between]: [startDate, endDate] } }
        }),
        Order.count({
          where: { createdAt: { [Op.between]: [startDate, endDate] } }
        }),
        Order.count({
          where: {
            createdAt: { [Op.between]: [startDate, endDate] },
            status: 'delivered'
          }
        })
      ]);

      analyticsData.conversion = {
        visitors,
        cartsCreated,
        ordersPlaced,
        ordersCompleted,
        cartConversion: cartsCreated > 0 ? (ordersPlaced / cartsCreated * 100).toFixed(2) : 0,
        orderCompletion: ordersPlaced > 0 ? (ordersCompleted / ordersPlaced * 100).toFixed(2) : 0
      };
    }

    res.status(200).json({
      status: 'success',
      data: {
        period,
        startDate,
        endDate,
        analytics: analyticsData
      }
    });
  } catch (error) {
    logger.error('Admin analytics error:', error);
    return next(new AppError('Error fetching analytics data', 500));
  }
};

module.exports = {
  getDashboard,
  getUsers,
  loginAsUser,
  getOrders,
  updateOrderStatus,
  getStock,
  createStockMovement,
  getAnalytics
};