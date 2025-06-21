#!/usr/bin/env node
'use strict';

const { exec } = require('child_process');
const { promisify } = require('util');
const logger = require('../utils/logger');
const path = require('path');

const execAsync = promisify(exec);

const migrateDatabase = async () => {
  try {
    logger.info('Starting database migration...');
    
    // Check if we should reset the database (development only)
    const reset = process.env.NODE_ENV === 'development' && process.argv.includes('--reset');
    const seed = process.argv.includes('--seed');
    
    if (reset) {
      logger.warn('Reset flag detected - this will undo all migrations!');
      const confirm = process.argv.includes('--yes');
      if (!confirm) {
        logger.error('Please add --yes flag to confirm database reset');
        process.exit(1);
      }
      
      // Undo all migrations
      logger.info('Undoing all migrations...');
      try {
        const { stdout: undoOut, stderr: undoErr } = await execAsync('npx sequelize-cli db:migrate:undo:all');
        if (undoErr) logger.warn('Undo warnings:', undoErr);
        logger.info('All migrations undone successfully');
      } catch (error) {
        logger.warn('No migrations to undo or undo failed:', error.message);
      }
    }
    
    // Run migrations
    logger.info('Running migrations...');
    const { stdout: migrateOut, stderr: migrateErr } = await execAsync('npx sequelize-cli db:migrate');
    if (migrateErr) logger.warn('Migration warnings:', migrateErr);
    logger.info('Migrations completed successfully');
    
    // Get migration status
    const { stdout: statusOut } = await execAsync('npx sequelize-cli db:migrate:status');
    logger.info('Migration status:\n' + statusOut);
    
    // Run seeders if requested
    if (seed) {
      logger.info('Running seeders...');
      
      if (reset) {
        // First undo all seeds if resetting
        try {
          const { stdout: undoSeedOut, stderr: undoSeedErr } = await execAsync('npx sequelize-cli db:seed:undo:all');
          if (undoSeedErr) logger.warn('Seed undo warnings:', undoSeedErr);
          logger.info('All seeds undone successfully');
        } catch (error) {
          logger.warn('No seeds to undo or undo failed:', error.message);
        }
      }
      
      const { stdout: seedOut, stderr: seedErr } = await execAsync('npx sequelize-cli db:seed:all');
      if (seedErr) logger.warn('Seeding warnings:', seedErr);
      logger.info('Seeding completed successfully');
    }
    
    logger.info('Database migration process completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Database migration failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  migrateDatabase();
}

module.exports = migrateDatabase;