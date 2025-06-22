const { RelayPoint, Order, DeliveryOption, sequelize } = require('../models');
const { RelayPointGeo } = require('../models/mongo');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const getRelayPoints = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    search = '',
    type = '',
    carrier = '',
    city = '',
    postalCode = '',
    isActive = '',
    sort = 'name'
  } = req.query;

  const offset = (page - 1) * limit;
  const where = {};

  // Search by name or external ID
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { externalId: { [Op.iLike]: `%${search}%` } }
    ];
  }

  // Filter by type
  if (type) {
    where.type = type;
  }

  // Filter by carrier
  if (carrier) {
    where.carrier = carrier;
  }

  // Filter by city
  if (city) {
    where.city = { [Op.iLike]: `%${city}%` };
  }

  // Filter by postal code
  if (postalCode) {
    where.postalCode = postalCode;
  }

  // Filter by active status
  if (isActive !== '') {
    where.isActive = isActive === 'true';
  }

  // Parse sort parameter
  const order = [];
  if (sort.startsWith('-')) {
    order.push([sort.substring(1), 'DESC']);
  } else {
    order.push([sort, 'ASC']);
  }

  const { count, rows: relayPoints } = await RelayPoint.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset,
    order,
    attributes: {
      include: [
        // Add order count
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM orders
            WHERE orders.relay_point_id = "RelayPoint"."id"
          )`),
          'orderCount'
        ]
      ]
    }
  });

  // Get capacity info from MongoDB
  const relayPointIds = relayPoints.map(rp => rp.id);
  const mongoData = await RelayPointGeo.find({
    relayPointId: { $in: relayPointIds }
  }).select('relayPointId capacity ratings');

  const mongoMap = mongoData.reduce((acc, item) => {
    acc[item.relayPointId] = {
      capacity: item.capacity,
      ratings: item.ratings
    };
    return acc;
  }, {});

  // Merge data
  const enrichedRelayPoints = relayPoints.map(rp => {
    const rpData = rp.toJSON();
    const mongoInfo = mongoMap[rp.id] || {};
    return {
      ...rpData,
      capacity: mongoInfo.capacity,
      ratings: mongoInfo.ratings
    };
  });

  res.status(200).json({
    status: 'success',
    data: {
      relayPoints: enrichedRelayPoints,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        perPage: parseInt(limit)
      }
    }
  });
});

const getRelayPoint = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const relayPoint = await RelayPoint.findByPk(id, {
    include: [
      {
        model: Order,
        attributes: ['id', 'createdAt', 'totalAmount'],
        limit: 10,
        order: [['createdAt', 'DESC']]
      },
      {
        model: DeliveryOption,
        attributes: ['id', 'name', 'price']
      }
    ]
  });

  if (!relayPoint) {
    return next(new AppError('Relay point not found', 404));
  }

  // Get MongoDB data
  const mongoData = await RelayPointGeo.findOne({ relayPointId: id });

  // Get usage statistics
  const stats = await Order.findAll({
    where: { relayPointId: id },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
      [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount']
    ],
    group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
    order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'DESC']],
    limit: 12,
    raw: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      relayPoint: {
        ...relayPoint.toJSON(),
        mongoData,
        stats
      }
    }
  });
});

const createRelayPoint = catchAsync(async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      externalId,
      name,
      type,
      carrier,
      address,
      postalCode,
      city,
      country,
      coordinates,
      phone,
      email,
      openingHours,
      holidays,
      services,
      accessInfo,
      maxPackageWeight,
      maxPackageDimensions,
      parkingAvailable,
      wheelchairAccessible,
      accessibilityFeatures,
      lockerCount,
      isActive
    } = req.body;

    // Validate required fields
    if (!name || !type || !address || !postalCode || !city || !coordinates) {
      await transaction.rollback();
      return next(new AppError('Missing required fields', 400));
    }

    // Check if external ID already exists
    if (externalId) {
      const existing = await RelayPoint.findOne({
        where: { externalId },
        transaction
      });
      if (existing) {
        await transaction.rollback();
        return next(new AppError('Relay point with this external ID already exists', 400));
      }
    }

    // Create in PostgreSQL
    const relayPoint = await RelayPoint.create({
      externalId: externalId || `MANUAL_${Date.now()}`,
      name,
      type,
      carrier: carrier || 'La Poste',
      address,
      postalCode,
      city,
      country: country || 'France',
      coordinates: sequelize.fn('ST_GeomFromText', `POINT(${coordinates.lng} ${coordinates.lat})`),
      phone,
      email,
      openingHours: openingHours || {},
      holidays: holidays || [],
      services: services || [],
      accessInfo,
      maxPackageWeight: maxPackageWeight || 30,
      maxPackageDimensions: maxPackageDimensions || { length: 100, width: 60, height: 60 },
      parkingAvailable: parkingAvailable || false,
      wheelchairAccessible: wheelchairAccessible || false,
      accessibilityFeatures: accessibilityFeatures || [],
      lockerCount: type === 'locker' ? lockerCount : null,
      isActive: isActive !== undefined ? isActive : true
    }, { transaction });

    // Create in MongoDB
    await RelayPointGeo.create({
      relayPointId: relayPoint.id,
      externalId: relayPoint.externalId,
      code: relayPoint.externalId,
      name,
      type,
      carrier: relayPoint.carrier,
      location: {
        type: 'Point',
        coordinates: [coordinates.lng, coordinates.lat]
      },
      address: {
        street: address.street,
        city,
        postalCode,
        country: country || 'France'
      },
      openingHours,
      holidays,
      services,
      capacity: {
        maxPackagesPerDay: 100,
        currentPackages: 0,
        averageWaitTime: 5
      },
      contact: {
        phone,
        email
      },
      metadata: {
        source: 'manual',
        lastSync: new Date()
      }
    });

    await transaction.commit();

    logger.info(`Relay point ${name} created by user ${req.user.id}`);

    res.status(201).json({
      status: 'success',
      data: { relayPoint }
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

const updateRelayPoint = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  const relayPoint = await RelayPoint.findByPk(id);

  if (!relayPoint) {
    return next(new AppError('Relay point not found', 404));
  }

  // Update PostgreSQL
  if (updates.coordinates) {
    updates.coordinates = sequelize.fn(
      'ST_GeomFromText',
      `POINT(${updates.coordinates.lng} ${updates.coordinates.lat})`
    );
  }

  await relayPoint.update(updates);

  // Update MongoDB
  const mongoUpdates = {};
  if (updates.name) mongoUpdates.name = updates.name;
  if (updates.type) mongoUpdates.type = updates.type;
  if (updates.carrier) mongoUpdates.carrier = updates.carrier;
  if (updates.coordinates) {
    mongoUpdates.location = {
      type: 'Point',
      coordinates: [req.body.coordinates.lng, req.body.coordinates.lat]
    };
  }
  if (updates.address) mongoUpdates['address.street'] = updates.address.street;
  if (updates.city) mongoUpdates['address.city'] = updates.city;
  if (updates.postalCode) mongoUpdates['address.postalCode'] = updates.postalCode;
  if (updates.openingHours) mongoUpdates.openingHours = updates.openingHours;
  if (updates.holidays) mongoUpdates.holidays = updates.holidays;
  if (updates.services) mongoUpdates.services = updates.services;
  if (updates.phone) mongoUpdates['contact.phone'] = updates.phone;
  if (updates.email) mongoUpdates['contact.email'] = updates.email;
  if (updates.isActive !== undefined) mongoUpdates.isActive = updates.isActive;
  if (updates.temporarilyClosed !== undefined) mongoUpdates.temporarilyClosed = updates.temporarilyClosed;

  await RelayPointGeo.findOneAndUpdate(
    { relayPointId: id },
    mongoUpdates,
    { new: true }
  );

  logger.info(`Relay point ${relayPoint.name} updated by user ${req.user.id}`);

  res.status(200).json({
    status: 'success',
    data: { relayPoint }
  });
});

const deleteRelayPoint = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const relayPoint = await RelayPoint.findByPk(id);

  if (!relayPoint) {
    return next(new AppError('Relay point not found', 404));
  }

  // Check if has orders
  const orderCount = await Order.count({
    where: { relayPointId: id }
  });

  if (orderCount > 0) {
    return next(new AppError('Cannot delete relay point with existing orders. Deactivate it instead.', 400));
  }

  // Delete from MongoDB first
  await RelayPointGeo.findOneAndDelete({ relayPointId: id });

  // Delete from PostgreSQL
  await relayPoint.destroy();

  logger.info(`Relay point ${relayPoint.name} deleted by user ${req.user.id}`);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

const updateRelayPointCapacity = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { maxPackagesPerDay, currentPackages } = req.body;

  const mongoRelayPoint = await RelayPointGeo.findOne({ relayPointId: id });

  if (!mongoRelayPoint) {
    return next(new AppError('Relay point not found', 404));
  }

  if (maxPackagesPerDay !== undefined) {
    mongoRelayPoint.capacity.maxPackagesPerDay = maxPackagesPerDay;
  }

  if (currentPackages !== undefined) {
    mongoRelayPoint.capacity.currentPackages = currentPackages;
  }

  await mongoRelayPoint.save();

  res.status(200).json({
    status: 'success',
    data: { capacity: mongoRelayPoint.capacity }
  });
});

const getRelayPointAnalytics = catchAsync(async (req, res, next) => {
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

  // Get order statistics
  const orderStats = await Order.findAll({
    where: {
      relayPointId: id,
      createdAt: { [Op.between]: [startDate, endDate] }
    },
    attributes: [
      [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
      [sequelize.fn('AVG', sequelize.col('totalAmount')), 'avgOrderValue']
    ],
    group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
    order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
    raw: true
  });

  // Get peak hours
  const peakHours = await Order.findAll({
    where: {
      relayPointId: id,
      createdAt: { [Op.between]: [startDate, endDate] }
    },
    attributes: [
      [sequelize.fn('EXTRACT', sequelize.literal('HOUR FROM "createdAt"')), 'hour'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount']
    ],
    group: [sequelize.fn('EXTRACT', sequelize.literal('HOUR FROM "createdAt"'))],
    order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
    raw: true
  });

  // Get customer demographics from MongoDB
  const mongoData = await RelayPointGeo.findOne({ relayPointId: id });

  res.status(200).json({
    status: 'success',
    data: {
      period,
      startDate,
      endDate,
      analytics: {
        orderStats,
        peakHours,
        capacity: mongoData?.capacity,
        ratings: mongoData?.ratings
      }
    }
  });
});

const searchNearbyRelayPoints = catchAsync(async (req, res, next) => {
  const { lat, lng, radius = 10000, limit = 20 } = req.query;

  if (!lat || !lng) {
    return next(new AppError('Latitude and longitude are required', 400));
  }

  const relayPoints = await RelayPointGeo.findNearby(
    [parseFloat(lng), parseFloat(lat)],
    parseInt(radius),
    parseInt(limit)
  );

  res.status(200).json({
    status: 'success',
    data: {
      relayPoints,
      search: {
        center: { lat: parseFloat(lat), lng: parseFloat(lng) },
        radius: parseInt(radius),
        resultCount: relayPoints.length
      }
    }
  });
});

module.exports = {
  getRelayPoints,
  getRelayPoint,
  createRelayPoint,
  updateRelayPoint,
  deleteRelayPoint,
  updateRelayPointCapacity,
  getRelayPointAnalytics,
  searchNearbyRelayPoints
};