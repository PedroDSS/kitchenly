const { EmailAlert, User, Product, Category } = require('../models');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

exports.getAlerts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, enabled } = req.query;

    const whereClause = { userId };
    
    if (type) {
      whereClause.type = type;
    }
    
    if (enabled !== undefined) {
      whereClause.enabled = enabled === 'true';
    }

    const alerts = await EmailAlert.findAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'slug', 'price', 'stock', 'images']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: alerts
    });
  } catch (error) {
    logger.error('Error fetching email alerts:', error);
    next(error);
  }
};

exports.createAlert = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, categoryId, productId, enabled, frequency, threshold, expiresAt } = req.body;

    // Check if alert already exists
    const existingAlert = await EmailAlert.findOne({
      where: {
        userId,
        type,
        categoryId: categoryId || null,
        productId: productId || null
      }
    });

    if (existingAlert) {
      return next(new AppError('Cette alerte existe déjà', 400));
    }

    // Validate category or product exists
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return next(new AppError('Catégorie non trouvée', 404));
      }
    }

    if (productId) {
      const product = await Product.findByPk(productId);
      if (!product) {
        return next(new AppError('Produit non trouvé', 404));
      }
    }

    const alert = await EmailAlert.create({
      userId,
      type,
      categoryId,
      productId,
      enabled: enabled !== false,
      frequency: frequency || 'immediate',
      threshold,
      expiresAt
    });

    // Reload with associations
    const createdAlert = await EmailAlert.findByPk(alert.id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'slug', 'price', 'stock', 'images']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      data: createdAlert
    });
  } catch (error) {
    logger.error('Error creating email alert:', error);
    next(error);
  }
};

exports.updateAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { enabled, frequency, threshold, expiresAt } = req.body;

    const alert = await EmailAlert.findOne({
      where: { id, userId }
    });

    if (!alert) {
      return next(new AppError('Alerte non trouvée', 404));
    }

    // Update only allowed fields
    const updates = {};
    if (enabled !== undefined) updates.enabled = enabled;
    if (frequency) updates.frequency = frequency;
    if (threshold !== undefined) updates.threshold = threshold;
    if (expiresAt !== undefined) updates.expiresAt = expiresAt;

    await alert.update(updates);

    // Reload with associations
    const updatedAlert = await EmailAlert.findByPk(alert.id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'slug', 'price', 'stock', 'images']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    res.json({
      status: 'success',
      data: updatedAlert
    });
  } catch (error) {
    logger.error('Error updating email alert:', error);
    next(error);
  }
};

exports.deleteAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const alert = await EmailAlert.findOne({
      where: { id, userId }
    });

    if (!alert) {
      return next(new AppError('Alerte non trouvée', 404));
    }

    await alert.destroy();

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error('Error deleting email alert:', error);
    next(error);
  }
};

exports.getAlertStatistics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const stats = await EmailAlert.findAll({
      where: { userId },
      attributes: [
        'type',
        [EmailAlert.sequelize.fn('COUNT', EmailAlert.sequelize.col('type')), 'count'],
        [EmailAlert.sequelize.fn('SUM', EmailAlert.sequelize.literal('CASE WHEN enabled = true THEN 1 ELSE 0 END')), 'enabled_count']
      ],
      group: ['type']
    });

    const totalAlerts = await EmailAlert.count({ where: { userId } });
    const enabledAlerts = await EmailAlert.count({ where: { userId, enabled: true } });

    res.json({
      status: 'success',
      data: {
        total: totalAlerts,
        enabled: enabledAlerts,
        byType: stats
      }
    });
  } catch (error) {
    logger.error('Error fetching alert statistics:', error);
    next(error);
  }
};

// Admin endpoints
exports.getAllAlerts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, enabled } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (type) whereClause.type = type;
    if (enabled !== undefined) whereClause.enabled = enabled === 'true';

    const { count, rows } = await EmailAlert.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        alerts: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching all alerts:', error);
    next(error);
  }
};

exports.bulkDisableAlerts = async (req, res, next) => {
  try {
    const { alertIds } = req.body;

    if (!alertIds || !Array.isArray(alertIds)) {
      return next(new AppError('IDs d\'alertes requis', 400));
    }

    const updated = await EmailAlert.update(
      { enabled: false },
      { where: { id: { [Op.in]: alertIds } } }
    );

    res.json({
      status: 'success',
      data: {
        updatedCount: updated[0]
      }
    });
  } catch (error) {
    logger.error('Error bulk disabling alerts:', error);
    next(error);
  }
};