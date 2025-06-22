const nodemailer = require('nodemailer');
const pug = require('pug');
const path = require('path');
const htmlToText = require('html-to-text');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.from = `Kitchenly <${process.env.EMAIL_FROM || 'contact.kitchenly@gmail.com'}>`;
  }

  createTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'localhost',
      port: process.env.EMAIL_PORT || 1025,
      ignoreTLS: true
    });
  }

  async send(to, subject, template, data) {
    try {
      const templatePath = path.join(__dirname, '..', 'views', 'emails', `${template}.pug`);
      const html = pug.renderFile(templatePath, {
        ...data,
        subject,
        appUrl: process.env.FRONTEND_URL || 'http://localhost:8080'
      });

      const mailOptions = {
        from: this.from,
        to,
        subject,
        html,
        text: htmlToText.convert(html)
      };

      const transport = this.createTransport();
      const info = await transport.sendMail(mailOptions);

      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendWelcome(user) {
    await this.send(
      user.email,
      'Bienvenue chez Kitchenly',
      'welcome',
      {
        firstName: user.firstName,
        confirmationUrl: `${process.env.FRONTEND_URL}/confirm-email/${user.confirmationToken}`
      }
    );
  }

  async sendEmailConfirmation(user, confirmationToken) {
    const confirmationUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/confirm-email/${confirmationToken}`;
    
    await this.send(
      user.email,
      'Confirmez votre adresse email - Kitchenly',
      'confirmEmail',
      {
        firstName: user.firstName,
        confirmationUrl
      }
    );
  }

  async sendPasswordReset(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password/${resetToken}`;
    
    await this.send(
      user.email,
      'Réinitialisation de votre mot de passe - Kitchenly',
      'passwordReset',
      {
        firstName: user.firstName,
        resetUrl,
        validityMinutes: 10
      }
    );
  }

  async sendPasswordChanged(user) {
    await this.send(
      user.email,
      'Votre mot de passe a été modifié - Kitchenly',
      'passwordChanged',
      {
        firstName: user.firstName,
        changedAt: new Date().toLocaleString('fr-FR')
      }
    );
  }

  async sendAccountLocked(user) {
    await this.send(
      user.email,
      'Compte verrouillé - Kitchenly',
      'accountLocked',
      {
        firstName: user.firstName,
        unlockTime: new Date(user.accountLockedUntil).toLocaleString('fr-FR')
      }
    );
  }

  async sendOrderConfirmation(email, order) {
    const user = order.user || { email, firstName: 'Client' };
    await this.send(
      email,
      `Confirmation de commande #${order.orderNumber} - Kitchenly`,
      'orderConfirmation',
      {
        firstName: user.firstName,
        order,
        orderUrl: `${process.env.FRONTEND_URL}/orders/${order.id}`
      }
    );
  }

  async sendInvoice(user, order, invoicePath) {
    await this.send(
      user.email,
      `Facture #${order.invoiceNumber} - Kitchenly`,
      'invoice',
      {
        firstName: user.firstName,
        order,
        invoicePath
      }
    );
  }

  async sendStockAlert(user, product) {
    await this.send(
      user.email,
      `${product.name} est de nouveau en stock - Kitchenly`,
      'stockAlert',
      {
        firstName: user.firstName,
        product
      }
    );
  }

  async sendPriceAlert(user, product, oldPrice, newPrice) {
    await this.send(
      user.email,
      `Baisse de prix sur ${product.name} - Kitchenly`,
      'priceAlert',
      {
        firstName: user.firstName,
        product,
        oldPrice,
        newPrice,
        discount: Math.round((1 - newPrice / oldPrice) * 100)
      }
    );
  }

  async sendAccountDeleted(email) {
    await this.send(
      email,
      'Confirmation de suppression de compte - Kitchenly',
      'accountDeleted',
      {
        deletedAt: new Date().toLocaleString('fr-FR')
      }
    );
  }

  async sendDataExport(user, fileName) {
    await this.send(
      user.email,
      'Export de vos données personnelles - Kitchenly',
      'dataExport',
      {
        firstName: user.firstName,
        fileName,
        exportedAt: new Date().toLocaleString('fr-FR')
      }
    );
  }

  async sendEmailChanged(oldEmail, newEmail) {
    await this.send(
      oldEmail,
      'Changement d\'adresse email - Kitchenly',
      'emailChanged',
      {
        oldEmail,
        newEmail,
        changedAt: new Date().toLocaleString('fr-FR')
      }
    );
  }

  async sendOrderCancellation(email, order) {
    const user = order.user || { email, firstName: 'Client' };
    await this.send(
      email,
      `Annulation de commande #${order.orderNumber} - Kitchenly`,
      'orderCancellation',
      {
        firstName: user.firstName,
        order,
        cancelReason: order.cancelReason || 'Demande client',
        refundInfo: order.paymentStatus === 'refunded' ? 'Votre remboursement a été initié et sera crédité sous 5-10 jours ouvrés.' : null
      }
    );
  }

  async sendReturnConfirmation(email, order, returnedItems) {
    const user = order.user || { email, firstName: 'Client' };
    await this.send(
      email,
      `Confirmation de retour - Commande #${order.orderNumber} - Kitchenly`,
      'returnConfirmation',
      {
        firstName: user.firstName,
        order,
        returnedItems,
        returnReason: order.returnReason,
        nextSteps: 'Notre équipe examinera votre demande de retour dans les 48 heures.'
      }
    );
  }

  async sendOrderShipped(email, order) {
    const user = order.user || { email, firstName: 'Client' };
    await this.send(
      email,
      `Votre commande #${order.orderNumber} a été expédiée - Kitchenly`,
      'orderShipped',
      {
        firstName: user.firstName,
        order,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingNumber ? `https://track.laposte.fr/track?trackingNumber=${order.trackingNumber}` : null,
        estimatedDelivery: order.estimatedDeliveryDate
      }
    );
  }

  async sendOrderDelivered(email, order) {
    const user = order.user || { email, firstName: 'Client' };
    await this.send(
      email,
      `Votre commande #${order.orderNumber} a été livrée - Kitchenly`,
      'orderDelivered',
      {
        firstName: user.firstName,
        order,
        reviewUrl: `${process.env.FRONTEND_URL}/orders/${order.id}/review`
      }
    );
  }

  async sendNewProductAlert(user, product, category) {
    await this.send(
      user.email,
      `Nouveau produit dans ${category.name} - Kitchenly`,
      'newProductAlert',
      {
        firstName: user.firstName,
        product,
        category,
        productUrl: `${process.env.FRONTEND_URL}/products/${product.slug}`
      }
    );
  }

  async sendLowStockAlert(user, product, currentStock, threshold) {
    await this.send(
      user.email,
      `Stock faible: ${product.name} - Kitchenly`,
      'lowStockAlert',
      {
        firstName: user.firstName,
        product,
        currentStock,
        threshold,
        productUrl: `${process.env.FRONTEND_URL}/products/${product.slug}`
      }
    );
  }
}

module.exports = new EmailService();