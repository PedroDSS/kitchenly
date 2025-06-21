const { Order } = require('../models');
const cron = require('node-cron');

const initDeliveryCronJob = () => {
    console.log('Initialisation de la cron tab pour les livraisons.');

    cron.schedule('*/5 * * * *', async () => {
        console.log('Changements des status de livraisons (5 minutes)');
        try {

            const onDeliveryUpdateResult = await Order.update(
                { 
                    status: 'delivered',
                    deliveredAt: new Date()
                },
                {
                    where: {
                        status: 'shipped'
                    }
                }
            );
            console.log(`Commandes en shipped mises à jour à delivered : ${onDeliveryUpdateResult[0]} commandes.`);

            const pendingUpdateResult = await Order.update(
                { 
                    status: 'shipped',
                    shippedAt: new Date()
                },
                {
                    where: {
                        status: 'processing'
                    }
                }
            );
            console.log(`Commandes en processing mises à jour à shipped : ${pendingUpdateResult[0]} commandes.`);
            
        } catch (error) {
            console.error('Erreur lors de la mise à jour des statuts de livraison:', error);
        }
    });
};

module.exports = initDeliveryCronJob;
