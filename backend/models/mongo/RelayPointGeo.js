const mongoose = require('mongoose');

const relayPointGeoSchema = new mongoose.Schema({
  relayPointId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['post_office', 'relay_point', 'locker', 'partner_shop'],
    index: true
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true,
      index: true
    },
    postalCode: {
      type: String,
      required: true,
      index: true
    },
    country: {
      type: String,
      required: true,
      default: 'FR'
    },
    additionalInfo: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 &&
                 coords[1] >= -90 && coords[1] <= 90;
        },
        message: 'Invalid coordinates format [longitude, latitude]'
      }
    }
  },
  services: [{
    type: String,
    enum: [
      'standard_delivery',
      'express_delivery',
      'package_pickup',
      'returns',
      'printing',
      'packaging',
      'oversized_packages',
      'international_shipping'
    ]
  }],
  openingHours: {
    monday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    tuesday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    wednesday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    thursday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    friday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    saturday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    sunday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: true }
    }
  },
  holidays: [{
    date: Date,
    name: String,
    closed: { type: Boolean, default: true }
  }],
  capacity: {
    maxPackagesPerDay: Number,
    currentPackages: {
      type: Number,
      default: 0
    },
    averageWaitTime: {
      type: Number,
      default: 5
    }
  },
  accessibility: {
    wheelchairAccess: {
      type: Boolean,
      default: false
    },
    parkingAvailable: {
      type: Boolean,
      default: false
    },
    publicTransportNearby: {
      type: Boolean,
      default: false
    }
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  photos: [{
    url: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  contact: {
    phone: String,
    email: String,
    website: String
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isTemporarilyClosed: {
    type: Boolean,
    default: false,
    index: true
  },
  temporaryClosureReason: String,
  temporaryClosureUntil: Date,
  lastSync: {
    type: Date,
    default: Date.now
  },
  metadata: {
    laPosteId: String,
    lastModifiedByLaPoste: Date,
    syncErrors: [{
      date: Date,
      error: String
    }]
  }
}, {
  timestamps: true
});

relayPointGeoSchema.index({ location: '2dsphere' });
relayPointGeoSchema.index({ 'address.postalCode': 1, isActive: 1 });
relayPointGeoSchema.index({ type: 1, isActive: 1 });
relayPointGeoSchema.index({ services: 1 });
relayPointGeoSchema.index({ 'ratings.average': -1 });
relayPointGeoSchema.index({ isActive: 1, isTemporarilyClosed: 1 });

relayPointGeoSchema.statics.findNearby = async function(coordinates, maxDistance = 10000, limit = 20) {
  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true,
    isTemporarilyClosed: false
  };

  const results = await this.find(query)
    .limit(limit)
    .lean()
    .exec();

  // Add distance calculation to each result
  return results.map(result => ({
    ...result,
    distance: this.prototype.getDistance.call({ location: result.location }, coordinates) / 1000 // Convert to km
  }));
};

relayPointGeoSchema.statics.findInArea = async function(bounds, options = {}) {
  const {
    type,
    services = [],
    onlyActive = true
  } = options;

  const query = {
    location: {
      $geoWithin: {
        $box: bounds
      }
    }
  };

  if (onlyActive) {
    query.isActive = true;
    query.isTemporarilyClosed = false;
  }

  if (type) {
    query.type = type;
  }

  if (services.length > 0) {
    query.services = { $all: services };
  }

  return this.find(query).lean();
};

relayPointGeoSchema.statics.findByPostalCode = async function(postalCode, limit = 10) {
  const query = {
    'address.postalCode': postalCode,
    isActive: true,
    isTemporarilyClosed: false
  };

  return this.find(query)
    .limit(limit)
    .sort({ 'ratings.average': -1 })
    .lean();
};

relayPointGeoSchema.methods.isOpenAt = function(date = new Date()) {
  const dayOfWeek = date.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
  const daySchedule = this.openingHours[dayOfWeek];

  if (!daySchedule || daySchedule.closed) {
    return false;
  }

  const isHoliday = this.holidays.some(holiday => {
    const holidayDate = new Date(holiday.date);
    return holidayDate.toDateString() === date.toDateString() && holiday.closed;
  });

  if (isHoliday) {
    return false;
  }

  if (this.isTemporarilyClosed && this.temporaryClosureUntil) {
    if (date < this.temporaryClosureUntil) {
      return false;
    }
  }

  const currentTime = date.getHours() * 60 + date.getMinutes();
  const [openHour, openMinute] = daySchedule.open.split(':').map(Number);
  const [closeHour, closeMinute] = daySchedule.close.split(':').map(Number);
  
  const openTime = openHour * 60 + openMinute;
  const closeTime = closeHour * 60 + closeMinute;

  return currentTime >= openTime && currentTime <= closeTime;
};

relayPointGeoSchema.methods.getDistance = function(coordinates) {
  const [lon1, lat1] = this.location.coordinates;
  const [lon2, lat2] = coordinates;

  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c * 1000;
};

relayPointGeoSchema.methods.hasCapacity = function() {
  if (!this.capacity.maxPackagesPerDay) {
    return true;
  }
  return this.capacity.currentPackages < this.capacity.maxPackagesPerDay;
};

relayPointGeoSchema.statics.updateCapacity = async function(relayPointId, increment = 1) {
  return this.findOneAndUpdate(
    { relayPointId },
    { $inc: { 'capacity.currentPackages': increment } },
    { new: true }
  );
};

relayPointGeoSchema.statics.resetDailyCapacities = async function() {
  return this.updateMany(
    {},
    { $set: { 'capacity.currentPackages': 0 } }
  );
};

relayPointGeoSchema.statics.aggregateByRegion = async function() {
  return this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: {
          postalCode: { $substr: ['$address.postalCode', 0, 2] },
          type: '$type'
        },
        count: { $sum: 1 },
        averageRating: { $avg: '$ratings.average' },
        totalCapacity: { $sum: '$capacity.maxPackagesPerDay' }
      }
    },
    {
      $sort: { '_id.postalCode': 1 }
    }
  ]);
};

module.exports = mongoose.model('RelayPointGeo', relayPointGeoSchema);