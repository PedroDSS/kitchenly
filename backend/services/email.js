const nodemailer = require('nodemailer');
const pug = require('pug');
const path = require('path');
const htmlToText = require('html-to-text');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.from = `Kitchenly <${process.env.EMAIL_FROM || 'noreply@kitchenly.com'}>`;
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

  async sendOrderConfirmation(user, order) {
    await this.send(
      user.email,
      `Confirmation de commande #${order.orderNumber} - Kitchenly`,
      'orderConfirmation',
      {
        firstName: user.firstName,
        order
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
}

module.exports = new EmailService();