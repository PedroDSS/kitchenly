const cron = require('node-cron');
const { EmailAlert, Product, Category, User } = require('../models/postgres');
const emailService = require('../services/email');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// Track processed alerts to avoid duplicates
const processedAlerts = new Map();

// Clean up processed alerts cache every hour
setInterval(() => {
  processedAlerts.clear();
}, 60 * 60 * 1000);

// Process immediate alerts
async function processImmediateAlerts(event, data) {
  try {
    const alerts = await EmailAlert.scope('active').findAll({
      where: {
        frequency: 'immediate',
        [Op.or]: [
          { productId: data.productId || null },
          { categoryId: data.categoryId || null }
        ]
      },
      include: [
        { model: User, as: 'user' },
        { model: Product, as: 'product' },
        { model: Category, as: 'category' }
      ]
    });

    for (const alert of alerts) {
      if (alert.shouldTrigger(event, data)) {
        const alertKey = `${alert.id}-${event}-${Date.now()}`;
        
        // Skip if already processed recently
        if (processedAlerts.has(alertKey)) continue;
        
        await sendAlertEmail(alert, event, data);
        processedAlerts.set(alertKey, true);
        
        // Update lastSentAt
        await alert.update({ lastSentAt: new Date() });
      }
    }
  } catch (error) {
    logger.error('Error processing immediate alerts:', error);
  }
}

// Send alert email based on type
async function sendAlertEmail(alert, event, data) {
  try {
    const user = alert.user;
    
    switch (alert.type) {
      case 'price_drop':
        if (event === 'price_changed' && data.newPrice < data.oldPrice) {
          await emailService.sendPriceAlert(
            user,
            alert.product || data.product,
            data.oldPrice,
            data.newPrice
          );
        }
        break;
        
      case 'back_in_stock':
        if (event === 'stock_changed' && data.oldStock === 0 && data.newStock > 0) {
          await emailService.sendStockAlert(
            user,
            alert.product || data.product
          );
        }
        break;
        
      case 'new_product':
        if (event === 'product_created') {
          await emailService.sendNewProductAlert(
            user,
            data.product,
            alert.category
          );
        }
        break;
        
      case 'low_stock':
        if (event === 'stock_changed' && data.newStock <= alert.threshold) {
          await emailService.sendLowStockAlert(
            user,
            alert.product || data.product,
            data.newStock,
            alert.threshold
          );
        }
        break;
    }
    
    logger.info(`Alert email sent: ${alert.type} to ${user.email}`);
  } catch (error) {
    logger.error(`Error sending alert email: ${alert.type}`, error);
  }
}

// Process daily digest alerts
async function processDailyAlerts() {
  try {
    const alerts = await EmailAlert.scope('active').findAll({
      where: {
        frequency: 'daily',
        [Op.or]: [
          { lastSentAt: null },
          { lastSentAt: { [Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        ]
      },
      include: [
        { model: User, as: 'user' },
        { model: Product, as: 'product' },
        { model: Category, as: 'category' }
      ]
    });

    // Group alerts by user
    const alertsByUser = alerts.reduce((acc, alert) => {
      const userId = alert.userId;
      if (!acc[userId]) acc[userId] = [];
      acc[userId].push(alert);
      return acc;
    }, {});

    // Send digest emails
    for (const [userId, userAlerts] of Object.entries(alertsByUser)) {
      await sendDigestEmail(userAlerts);
      
      // Update lastSentAt for all user alerts
      await EmailAlert.update(
        { lastSentAt: new Date() },
        { where: { id: { [Op.in]: userAlerts.map(a => a.id) } } }
      );
    }
  } catch (error) {
    logger.error('Error processing daily alerts:', error);
  }
}

// Process weekly digest alerts
async function processWeeklyAlerts() {
  try {
    const alerts = await EmailAlert.scope('active').findAll({
      where: {
        frequency: 'weekly',
        [Op.or]: [
          { lastSentAt: null },
          { lastSentAt: { [Op.lt]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
        ]
      },
      include: [
        { model: User, as: 'user' },
        { model: Product, as: 'product' },
        { model: Category, as: 'category' }
      ]
    });

    // Group alerts by user
    const alertsByUser = alerts.reduce((acc, alert) => {
      const userId = alert.userId;
      if (!acc[userId]) acc[userId] = [];
      acc[userId].push(alert);
      return acc;
    }, {});

    // Send digest emails
    for (const [userId, userAlerts] of Object.entries(alertsByUser)) {
      await sendDigestEmail(userAlerts);
      
      // Update lastSentAt for all user alerts
      await EmailAlert.update(
        { lastSentAt: new Date() },
        { where: { id: { [Op.in]: userAlerts.map(a => a.id) } } }
      );
    }
  } catch (error) {
    logger.error('Error processing weekly alerts:', error);
  }
}

// Send digest email with multiple alerts
async function sendDigestEmail(alerts) {
  try {
    if (!alerts.length) return;
    
    const user = alerts[0].user;
    const alertSummary = await generateAlertSummary(alerts);
    
    await emailService.send(
      user.email,
      'Vos alertes Kitchenly',
      'alertDigest',
      {
        firstName: user.firstName,
        alerts: alertSummary,
        manageAlertsUrl: `${process.env.FRONTEND_URL}/account/alerts`
      }
    );
    
    logger.info(`Digest email sent to ${user.email} with ${alerts.length} alerts`);
  } catch (error) {
    logger.error('Error sending digest email:', error);
  }
}

// Generate summary of alerts for digest
async function generateAlertSummary(alerts) {
  const summary = [];
  
  for (const alert of alerts) {
    let changes = [];
    
    // Fetch recent changes based on alert type
    switch (alert.type) {
      case 'price_drop':
        if (alert.product) {
          const priceHistory = await alert.product.getPriceHistory(7); // Last 7 days
          changes = priceHistory.filter(h => h.newPrice < h.oldPrice);
        }
        break;
        
      case 'back_in_stock':
        if (alert.product && alert.product.stock > 0) {
          changes.push({
            product: alert.product,
            inStock: true
          });
        }
        break;
        
      case 'new_product':
        if (alert.category) {
          const newProducts = await Product.findAll({
            where: {
              categoryId: alert.categoryId,
              createdAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            },
            limit: 5
          });
          changes = newProducts;
        }
        break;
    }
    
    if (changes.length > 0) {
      summary.push({
        alert,
        changes
      });
    }
  }
  
  return summary;
}

// Initialize cron jobs for alerts
function initEmailAlertsCronJob() {
  // Daily alerts at 9 AM
  cron.schedule('0 9 * * *', processDailyAlerts, {
    timezone: 'Europe/Paris'
  });
  
  // Weekly alerts on Monday at 9 AM
  cron.schedule('0 9 * * 1', processWeeklyAlerts, {
    timezone: 'Europe/Paris'
  });
  
  logger.info('Email alerts cron jobs initialized');
}

// Export functions for external use
module.exports = {
  initEmailAlertsCronJob,
  processImmediateAlerts,
  processDailyAlerts,
  processWeeklyAlerts
};