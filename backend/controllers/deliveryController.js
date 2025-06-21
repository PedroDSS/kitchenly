const { DeliveryOption, RelayPoint, Order } = require('../models/postgres');
const { RelayPointGeo } = require('../models/mongo');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');

/**
 * Generate a fake tracking number
 */
const generateTrackingNumber = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let trackingNumber = '';
  for (let i = 0; i < 13; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    trackingNumber += characters[randomIndex];
  }
  return trackingNumber;
};

/**
 * Get available delivery options for a given cart/order
 * Can be filtered by postal code, weight, etc.
 */
exports.getDeliveryOptions = catchAsync(async (req, res, next) => {
  const { postalCode, weight, totalAmount } = req.query;
  
  // Get all active delivery options
  let options = await DeliveryOption.findAll({
    where: {
      isActive: true
    },
    attributes: [
      'id', 
      'name', 
      'type', 
      'description', 
      'basePrice', 
      'estimatedDays',
      'maxWeight',
      'carrier'
    ]
  });

  // Filter by weight if provided
  if (weight) {
    const weightNum = parseFloat(weight);
    options = options.filter(opt => {
      return !opt.maxWeight || opt.maxWeight >= weightNum;
    });
  }

  // Calculate price for each option
  const optionsWithPrices = await Promise.all(
    options.map(async (option) => {
      const optionData = option.toJSON();
      
      // Calculate price based on weight and total amount
      let price = option.basePrice;
      
      // Add weight-based pricing if applicable
      if (weight && option.pricePerKg) {
        price += parseFloat(weight) * option.pricePerKg;
      }
      
      // Check if free delivery applies (e.g., orders over 100€)
      if (totalAmount && parseFloat(totalAmount) >= 100 && option.type === 'standard') {
        optionData.originalPrice = price;
        optionData.price = 0;
        optionData.freeDelivery = true;
      } else {
        optionData.price = price;
        optionData.freeDelivery = false;
      }
      
      // Add availability for zone
      if (postalCode) {
        const isAvailable = await option.checkAvailability(postalCode);
        optionData.available = isAvailable;
      } else {
        optionData.available = true;
      }
      
      return optionData;
    })
  );

  res.status(200).json({
    status: 'success',
    results: optionsWithPrices.length,
    data: {
      deliveryOptions: optionsWithPrices
    }
  });
});

/**
 * Calculate delivery cost for specific option and parameters
 */
exports.calculateDelivery = catchAsync(async (req, res, next) => {
  const { deliveryOptionId, weight, postalCode, totalAmount } = req.body;

  if (!deliveryOptionId) {
    return next(new AppError('Delivery option ID is required', 400));
  }

  const deliveryOption = await DeliveryOption.findByPk(deliveryOptionId);
  
  if (!deliveryOption) {
    return next(new AppError('Delivery option not found', 404));
  }

  // Check availability for postal code
  if (postalCode) {
    const isAvailable = await deliveryOption.checkAvailability(postalCode);
    if (!isAvailable) {
      return next(new AppError('This delivery option is not available for the specified postal code', 400));
    }
  }

  // Check weight limit
  if (weight && deliveryOption.maxWeight && weight > deliveryOption.maxWeight) {
    return next(new AppError(`Weight exceeds maximum limit of ${deliveryOption.maxWeight}kg for this delivery option`, 400));
  }

  // Calculate price
  const calculatedPrice = await deliveryOption.calculatePrice(weight || 0, postalCode);
  
  // Apply free delivery if applicable
  let finalPrice = calculatedPrice;
  let freeDelivery = false;
  
  if (totalAmount && parseFloat(totalAmount) >= 100 && deliveryOption.type === 'standard') {
    finalPrice = 0;
    freeDelivery = true;
  }

  res.status(200).json({
    status: 'success',
    data: {
      deliveryOption: {
        id: deliveryOption.id,
        name: deliveryOption.name,
        type: deliveryOption.type,
        carrier: deliveryOption.carrier,
        estimatedDays: deliveryOption.estimatedDays
      },
      calculation: {
        basePrice: deliveryOption.basePrice,
        weightSurcharge: calculatedPrice - deliveryOption.basePrice,
        calculatedPrice,
        finalPrice,
        freeDelivery,
        currency: 'EUR'
      }
    }
  });
});

/**
 * Get relay points near a location
 */
exports.getRelayPoints = catchAsync(async (req, res, next) => {
  const { lat, lng, radius = 10, postalCode, limit = 20 } = req.query;

  // Validate coordinates or postal code
  if (!lat || !lng) {
    if (!postalCode) {
      return next(new AppError('Either coordinates (lat, lng) or postal code is required', 400));
    }
  }

  let relayPoints;

  // Use MongoDB for geospatial queries
  if (lat && lng) {
    const coordinates = [parseFloat(lng), parseFloat(lat)];
    const radiusInMeters = parseFloat(radius) * 1000; // Convert km to meters

    relayPoints = await RelayPointGeo.findNearby(
      coordinates,
      radiusInMeters,
      parseInt(limit)
    );
  } else if (postalCode) {
    // Find by postal code
    relayPoints = await RelayPointGeo.findByPostalCode(postalCode, parseInt(limit));
  }

  // Get additional data from PostgreSQL
  if (relayPoints && relayPoints.length > 0) {
    const relayPointIds = relayPoints.map(rp => rp.relayPointId);
    
    const postgresData = await RelayPoint.findAll({
      where: {
        id: relayPointIds,
        isActive: true
      },
      attributes: [
        'id',
        'name',
        'type',
        'address',
        'postalCode',
        'city',
        'country',
        'phone',
        'openingHours',
        'services',
        'accessibilityFeatures'
      ]
    });

    // Merge MongoDB and PostgreSQL data
    const mergedData = relayPoints.map(mongoPoint => {
      const pgPoint = postgresData.find(p => p.id === mongoPoint.relayPointId);
      if (!pgPoint) return null;

      return {
        id: pgPoint.id,
        name: pgPoint.name,
        type: pgPoint.type,
        address: pgPoint.address,
        postalCode: pgPoint.postalCode,
        city: pgPoint.city,
        country: pgPoint.country,
        phone: pgPoint.phone,
        coordinates: {
          lat: mongoPoint.location.coordinates[1],
          lng: mongoPoint.location.coordinates[0]
        },
        distance: mongoPoint.distance || null,
        openingHours: pgPoint.openingHours,
        services: pgPoint.services,
        accessibilityFeatures: pgPoint.accessibilityFeatures,
        availableCapacity: mongoPoint.capacity ? mongoPoint.capacity.maxPackagesPerDay - mongoPoint.capacity.currentPackages : null,
        isOpen: pgPoint.isOpen()
      };
    }).filter(point => point !== null);

    res.status(200).json({
      status: 'success',
      results: mergedData.length,
      data: {
        relayPoints: mergedData
      }
    });
  } else {
    res.status(200).json({
      status: 'success',
      results: 0,
      data: {
        relayPoints: []
      }
    });
  }
});

/**
 * Track delivery (Mock implementation)
 * In production, this would integrate with La Poste API
 */
exports.trackDelivery = catchAsync(async (req, res, next) => {
  const { trackingNumber, orderId } = req.body;

  if (!trackingNumber && !orderId) {
    return next(new AppError('Either tracking number or order ID is required', 400));
  }

  let order;
  
  // Find order by tracking number or order ID
  if (orderId) {
    order = await Order.findOne({
      where: {
        id: orderId,
        userId: req.user.id // Ensure user owns the order
      }
    });
  } else {
    // In real implementation, would look up by tracking number
    // For now, mock it
    order = await Order.findOne({
      where: {
        trackingNumber: trackingNumber
      }
    });
  }

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Generate fake tracking number if not exists
  const mockTrackingNumber = order.trackingNumber || generateTrackingNumber();

  // Mock tracking data
  const mockTrackingEvents = [];
  const orderDate = new Date(order.createdAt);
  
  // Generate tracking events based on order status
  mockTrackingEvents.push({
    status: 'order_placed',
    description: 'Order has been placed',
    location: 'Online',
    timestamp: orderDate.toISOString()
  });

  if (['processing', 'shipped', 'delivered'].includes(order.status)) {
    const processingDate = new Date(orderDate);
    processingDate.setHours(processingDate.getHours() + 2);
    mockTrackingEvents.push({
      status: 'processing',
      description: 'Order is being prepared',
      location: 'Warehouse - Paris',
      timestamp: processingDate.toISOString()
    });
  }

  if (['shipped', 'delivered'].includes(order.status)) {
    const shippedDate = new Date(orderDate);
    shippedDate.setDate(shippedDate.getDate() + 1);
    mockTrackingEvents.push({
      status: 'shipped',
      description: 'Package has been shipped',
      location: 'Distribution Center - Paris',
      timestamp: shippedDate.toISOString()
    });

    const inTransitDate = new Date(shippedDate);
    inTransitDate.setHours(inTransitDate.getHours() + 6);
    mockTrackingEvents.push({
      status: 'in_transit',
      description: 'Package is in transit',
      location: 'En route',
      timestamp: inTransitDate.toISOString()
    });

    const outForDeliveryDate = new Date(shippedDate);
    outForDeliveryDate.setDate(outForDeliveryDate.getDate() + 1);
    mockTrackingEvents.push({
      status: 'out_for_delivery',
      description: 'Package is out for delivery',
      location: order.deliveryAddress.city || 'Local delivery office',
      timestamp: outForDeliveryDate.toISOString()
    });
  }

  if (order.status === 'delivered') {
    const deliveredDate = new Date(orderDate);
    deliveredDate.setDate(deliveredDate.getDate() + 2);
    mockTrackingEvents.push({
      status: 'delivered',
      description: 'Package has been delivered',
      location: 'Delivered to recipient',
      timestamp: deliveredDate.toISOString()
    });
  }

  // Calculate estimated delivery date
  const estimatedDelivery = new Date(orderDate);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

  res.status(200).json({
    status: 'success',
    data: {
      tracking: {
        trackingNumber: mockTrackingNumber,
        carrier: 'La Poste',
        currentStatus: order.status,
        estimatedDelivery: order.status === 'delivered' ? null : estimatedDelivery.toISOString(),
        deliveryAddress: {
          city: order.deliveryAddress?.city,
          postalCode: order.deliveryAddress?.postalCode,
          country: order.deliveryAddress?.country || 'France'
        },
        events: mockTrackingEvents.reverse() // Most recent first
      }
    }
  });
});

// Webhook endpoint for real carrier updates (future implementation)
exports.handleCarrierWebhook = catchAsync(async (req, res, next) => {
  // This would handle real-time updates from La Poste API or other integration
  logger.info('Carrier webhook received', { body: req.body });
  
  res.status(200).json({
    status: 'success',
    message: 'Webhook processed'
  });
});