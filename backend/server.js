const app = require('./app');
const logger = require('./utils/logger');
const { sequelize } = require('./models');

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Optionally sync database in development
    if (process.env.NODE_ENV === 'development' && process.env.DB_SYNC === 'true') {
      logger.info('Syncing database...');
      await sequelize.sync({ alter: true });
      logger.info('Database synced successfully');
    }
    
    app.listen(port, () => {
      logger.info(`App running on port ${port}...`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();