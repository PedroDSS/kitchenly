import cron from 'node-cron';
import Stock from '../../models/postgres/stockModel.js';
import Product from '../../models/postgres/productModel.js';
import UserAlert from '../../models/postgres/userAlertsModel.js';
import { getUserByIdDiff } from "../../controllers/userController.js";
import {sendLowStockAlertEmail, sendRestockAlertEmail} from "../../services/mailer/mailService.js";

// Stockage en mémoire pour éviter les spams
const lastRestockAlerts = new Map();
const lastLowStockAlerts = new Map();
const RESTOCK_COOLDOWN = 2 * 60 * 60 * 1000;
const LOW_STOCK_COOLDOWN = 2 * 60 * 60 * 1000;

const updateProductStock = async () => {
    try {
        const products = await Product.findAll();

        for (const product of products) {
            const productId = product.id;

            const stocks = await Stock.findAll({ where: { productId } });
            const totalStock = stocks.reduce((total, stock) => {
                return stock.operationType === 'ADD' ? total + stock.quantity : total - stock.quantity;
            }, 0);

            const previousStock = product.product_stock;

            await Product.update({ product_stock: totalStock }, {
                where: { id: productId }
            });


            if (previousStock === 0 && totalStock > 0) {
                const userAlerts = await UserAlert.findAll({
                    where: {
                        alertId: 2,
                        productId: productId,
                        isActive: true,
                    }
                });

                for (const alert of userAlerts) {
                    try {
                        const alertKey = `${alert.userId}-${productId}`;
                        const lastSent = lastRestockAlerts.get(alertKey);
                        const now = Date.now();
                        
                        if (!lastSent || (now - lastSent) > RESTOCK_COOLDOWN) {
                            const user = await getUserByIdDiff({ params: { id: alert.userId } });
                            if (user && user.email) {
                                await sendRestockAlertEmail(user.email, product);
                                lastRestockAlerts.set(alertKey, now);
                            }
                        }
                    } catch (userError) {
                    }
                }
            }

            if (totalStock < 4) {
                const lastSent = lastLowStockAlerts.get(productId);
                const now = Date.now();
                
                if (!lastSent || (now - lastSent) > LOW_STOCK_COOLDOWN) {
                    await sendLowStockAlertEmail(product);
                    lastLowStockAlerts.set(productId, now);
                }
            }
        }
    } catch (error) {
    }
};

const startStockUpdateCronJob = () => {
    cron.schedule('*/30 * * * *', updateProductStock);
};

export default startStockUpdateCronJob;
