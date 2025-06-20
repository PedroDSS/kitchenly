const mongoose = require('mongoose');
const logger = require('../../utils/logger');

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info('MongoDB connection successful!'))
  .catch((error) => logger.error('MongoDB connection error:', error));

module.exports = mongoose;