const cron = require('node-cron');
const { Cart, CartItem } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const cleanupExpiredCarts = async () => {
  try {
    const expiredCarts = await Cart.findAll({
      where: {
        expiresAt: { [Op.lt]: new Date() }
      }
    });

    if (expiredCarts.length === 0) {
      return;
    }

    const cartIds = expiredCarts.map(cart => cart.id);

    await CartItem.destroy({
      where: {
        cartId: { [Op.in]: cartIds }
      }
    });

    const deletedCount = await Cart.destroy({
      where: {
        id: { [Op.in]: cartIds }
      }
    });

    logger.info(`Cart cleanup: Removed ${deletedCount} expired carts`);
  } catch (error) {
    logger.error('Error during cart cleanup:', error);
  }
};

const cleanupExpiredReservations = async () => {
  try {
    const deletedCount = await CartItem.destroy({
      where: {
        reservedUntil: { [Op.lt]: new Date() }
      }
    });

    if (deletedCount > 0) {
      logger.info(`Reservation cleanup: Removed ${deletedCount} expired cart items`);
    }
  } catch (error) {
    logger.error('Error during reservation cleanup:', error);
  }
};

const initCartCleanupCronJob = () => {
  cron.schedule('*/5 * * * *', async () => {
    await cleanupExpiredCarts();
    await cleanupExpiredReservations();
  });

  logger.info('Cart cleanup cron job initialized (runs every 5 minutes)');
};

module.exports = initCartCleanupCronJob;