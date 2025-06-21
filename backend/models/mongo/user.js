const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    index: true
  },
  firstName: String,
  lastName: String,
  phone: String,
  customerType: {
    type: String,
    enum: ['individual', 'professional'],
    default: 'individual',
    index: true
  },
  companyName: String,
  siret: String,
  roles: [{
    type: String,
    index: true
  }],
  addresses: [{
    type: {
      type: String,
      enum: ['billing', 'shipping']
    },
    street: String,
    city: String,
    postalCode: String,
    country: String,
    isDefault: Boolean
  }],
  emailAlerts: [{
    alertId: String,
    productId: String,
    productName: String,
    alertType: String,
    createdAt: Date
  }],
  orders: [{
    orderId: String,
    orderNumber: String,
    total: Number,
    status: String,
    createdAt: Date
  }]
}, {
  timestamps: true
});

userSchema.index({ customerType: 1 });
userSchema.index({ 'addresses.city': 1 });
userSchema.index({ 'addresses.postalCode': 1 });

module.exports = mongoose.model('User', userSchema);