const { User, Order, OrderItem, Cart, CartItem, EmailAlert, PaymentTransaction, Invoice } = require('../models');
const AppError = require('../utils/appError');
const emailService = require('../services/email');
const { validatePassword } = require('../utils/passwordValidator');
const crypto = require('crypto');
const archiver = require('archiver');
const fs = require('fs').promises;
const path = require('path');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ['password', 'confirmationToken', 'confirmationTokenExpiry', 'resetPasswordToken', 'resetPasswordExpiry']
      }
    });

    if (!user) {
      return next(new AppError('Utilisateur non trouvé', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'phone', 'birthDate', 'newsletterSubscribed'];
    const filteredBody = {};

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });

    if (req.body.password || req.body.email) {
      return next(new AppError('Utilisez la route appropriée pour modifier le mot de passe ou l\'email', 400));
    }

    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return next(new AppError('Utilisateur non trouvé', 404));
    }

    await user.update(filteredBody);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          birthDate: user.birthDate,
          newsletterSubscribed: user.newsletterSubscribed,
          customerType: user.customerType,
          companyName: user.companyName,
          vatNumber: user.vatNumber
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, passwordConfirm } = req.body;

    if (!currentPassword || !newPassword || !passwordConfirm) {
      return next(new AppError('Veuillez fournir le mot de passe actuel et le nouveau mot de passe', 400));
    }

    if (newPassword !== passwordConfirm) {
      return next(new AppError('Les mots de passe ne correspondent pas', 400));
    }

    const user = await User.unscoped().findByPk(req.user.id, {
      attributes: {
        include: ['password']
      }
    });

    const isPasswordCorrect = await user.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
      return next(new AppError('Mot de passe actuel incorrect', 401));
    }

    validatePassword(newPassword);

    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    await emailService.sendPasswordChanged(user);

    res.status(200).json({
      status: 'success',
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const { password, confirmDeletion } = req.body;

    if (!password || confirmDeletion !== true) {
      return next(new AppError('Veuillez confirmer la suppression et fournir votre mot de passe', 400));
    }

    const user = await User.unscoped().findByPk(req.user.id, {
      attributes: {
        include: ['password']
      }
    });

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return next(new AppError('Mot de passe incorrect', 401));
    }

    const hasActiveOrders = await Order.count({
      where: {
        userId: user.id,
        status: ['pending', 'processing', 'shipped']
      }
    });

    if (hasActiveOrders > 0) {
      return next(new AppError('Impossible de supprimer le compte avec des commandes en cours', 400));
    }

    const anonymizedEmail = `deleted_${user.id}_${Date.now()}@deleted.com`;
    const anonymizedData = {
      email: anonymizedEmail,
      firstName: 'DELETED',
      lastName: 'USER',
      phone: null,
      birthDate: null,
      password: crypto.randomBytes(32).toString('hex'),
      isActive: false,
      isEmailConfirmed: false,
      gdprAnonymizedAt: new Date(),
      confirmationToken: null,
      confirmationTokenExpiry: null,
      resetPasswordToken: null,
      resetPasswordExpiry: null,
      newsletterSubscribed: false
    };

    await user.update(anonymizedData);

    await Cart.destroy({ where: { userId: user.id } });
    await EmailAlert.destroy({ where: { userId: user.id } });

    await emailService.sendAccountDeleted(user.email);

    res.clearCookie('jwt');
    res.status(200).json({
      status: 'success',
      message: 'Compte supprimé avec succès. Vos données ont été anonymisées conformément au RGPD.'
    });
  } catch (error) {
    next(error);
  }
};

const exportUserData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const userData = await User.findByPk(userId, {
      attributes: {
        exclude: ['password', 'confirmationToken', 'confirmationTokenExpiry', 'resetPasswordToken', 'resetPasswordExpiry']
      },
      include: [
        {
          model: Order,
          include: [
            {
              model: OrderItem,
              attributes: ['id', 'quantity', 'unitPrice', 'productId']
            },
            {
              model: PaymentTransaction,
              attributes: ['id', 'amount', 'status', 'createdAt']
            },
            {
              model: Invoice,
              attributes: ['id', 'number', 'createdAt']
            }
          ]
        },
        {
          model: EmailAlert,
          attributes: ['id', 'type', 'categoryId', 'productId', 'enabled', 'createdAt']
        }
      ]
    });

    if (!userData) {
      return next(new AppError('Utilisateur non trouvé', 404));
    }

    const exportData = {
      personalData: {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        birthDate: userData.birthDate,
        customerType: userData.customerType,
        companyName: userData.companyName,
        vatNumber: userData.vatNumber,
        newsletterSubscribed: userData.newsletterSubscribed,
        accountCreatedAt: userData.createdAt,
        lastLoginAt: userData.lastLoginAt,
        gdprConsentDate: userData.gdprConsentDate
      },
      orders: userData.Orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        items: order.OrderItems,
        payments: order.PaymentTransactions,
        invoices: order.Invoices
      })),
      emailAlerts: userData.EmailAlerts,
      exportDate: new Date(),
      exportFormat: 'JSON'
    };

    const fileName = `user_data_${userId}_${Date.now()}.json`;
    const filePath = path.join(__dirname, '..', 'temp', fileName);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    res.sendFile(filePath, async (err) => {
      if (err) {
        next(err);
      }
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.error('Error deleting temp file:', unlinkError);
      }
    });

    await emailService.sendDataExport(userData, fileName);
  } catch (error) {
    next(error);
  }
};

const updateEmail = async (req, res, next) => {
  try {
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return next(new AppError('Veuillez fournir le nouvel email et votre mot de passe', 400));
    }

    const user = await User.unscoped().findByPk(req.user.id, {
      attributes: {
        include: ['password']
      }
    });

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return next(new AppError('Mot de passe incorrect', 401));
    }

    const existingUser = await User.findOne({ where: { email: newEmail } });
    if (existingUser) {
      return next(new AppError('Cette adresse email est déjà utilisée', 400));
    }

    const oldEmail = user.email;
    user.email = newEmail;
    user.isEmailConfirmed = false;
    
    const confirmationToken = user.createConfirmationToken();
    await user.save();

    try {
      await emailService.sendEmailConfirmation(user, confirmationToken);
      await emailService.sendEmailChanged(oldEmail, newEmail);
      
      res.status(200).json({
        status: 'success',
        message: 'Email modifié. Veuillez confirmer votre nouvelle adresse email.'
      });
    } catch (error) {
      user.email = oldEmail;
      user.isEmailConfirmed = true;
      user.confirmationToken = undefined;
      user.confirmationTokenExpiry = undefined;
      await user.save({ validate: false });
      return next(new AppError('Erreur lors de l\'envoi de l\'email de confirmation', 500));
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  deleteAccount,
  exportUserData,
  updateEmail
};