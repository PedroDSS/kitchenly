#!/usr/bin/env node
'use strict';

const { sequelize } = require('../models');
const logger = require('../utils/logger');

const syncDatabase = async () => {
  try {
    logger.info('Starting database synchronization...');
    
    // Use force: false in production to avoid data loss
    const force = process.env.NODE_ENV === 'development' && process.argv.includes('--force');
    
    if (force) {
      logger.warn('Force sync enabled - this will drop existing tables!');
      const confirm = process.argv.includes('--yes');
      if (!confirm) {
        logger.error('Please add --yes flag to confirm force sync');
        process.exit(1);
      }
    }
    
    await sequelize.sync({ force, alter: !force });
    
    logger.info(`Database synchronized successfully${force ? ' (tables recreated)' : ''}`);
    
    // Verify tables were created
    const tables = await sequelize.getQueryInterface().showAllTables();
    logger.info(`Created tables: ${tables.join(', ')}`);
    
    process.exit(0);
  } catch (error) {
    logger.error('Database synchronization failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  syncDatabase();
}

module.exports = syncDatabase;