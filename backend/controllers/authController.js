const crypto = require('crypto');
const { Op } = require('sequelize');
const { User } = require('../models');
const AppError = require('../utils/appError');
const emailService = require('../services/email');
const { createSendToken } = require('../middleware/auth');
const { validatePassword } = require('../utils/passwordValidator');

const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, customerType, companyName, vatNumber } = req.body;

    const existingUser = await User.unscoped().findOne({
      where: { email }
    });

    if (existingUser) {
      return next(new AppError(400, 'Un compte avec cette adresse email existe déjà'));
    }

    validatePassword(password);

    const newUser = await User.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      customerType,
      companyName: customerType === 'B2B' ? companyName : null,
      vatNumber: customerType === 'B2B' ? vatNumber : null,
      gdprConsentDate: new Date()
    });

    const confirmationToken = newUser.createConfirmationToken();
    await newUser.save({ validate: false });

    try {
      await emailService.sendEmailConfirmation(newUser, confirmationToken);
    } catch (error) {
      newUser.confirmationToken = undefined;
      newUser.confirmationTokenExpiry = undefined;
      await newUser.save({ validate: false });
      return next(new AppError(500, 'Erreur lors de l\'envoi de l\'email de confirmation. Veuillez réessayer.'));
    }

    res.status(201).json({
      status: 'success',
      message: 'Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte.'
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Veuillez fournir une adresse email et un mot de passe', 400));
    }

    const user = await User.unscoped().findOne({
      where: { email },
      attributes: {
        include: ['password']
      }
    });

    if (!user) {
      return next(new AppError('Email ou mot de passe incorrect', 401));
    }

    if (user.isAccountLocked()) {
      const unlockTime = new Date(user.accountLockedUntil);
      const minutesLeft = Math.ceil((unlockTime - new Date()) / 60000);
      return next(new AppError(`Compte verrouillé. Réessayez dans ${minutesLeft} minutes.`, 423));
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      await user.incrementFailedAttempts();
      
      if (user.failedLoginAttempts >= 3) {
        await emailService.sendAccountLocked(user);
        return next(new AppError('Compte verrouillé après 3 tentatives échouées. Réessayez dans 30 minutes.', 423));
      }
      
      return next(new AppError(`Email ou mot de passe incorrect. ${3 - user.failedLoginAttempts} tentatives restantes.`, 401));
    }

    if (!user.isEmailConfirmed) {
      return next(new AppError('Veuillez confirmer votre adresse email avant de vous connecter.', 401));
    }

    if (user.isPasswordExpired()) {
      return next(new AppError('Votre mot de passe a expiré. Veuillez le réinitialiser.', 401));
    }

    await user.resetFailedAttempts();
    user.lastLoginAt = new Date();
    await user.save({ validate: false });

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

const confirmEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.unscoped().findOne({
      where: {
        confirmationToken: hashedToken,
        confirmationTokenExpiry: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return next(new AppError('Lien de confirmation invalide ou expiré', 400));
    }

    user.isEmailConfirmed = true;
    user.confirmationToken = null;
    user.confirmationTokenExpiry = null;
    await user.save({ validate: false });

    res.status(200).json({
      status: 'success',
      message: 'Email confirmé avec succès ! Vous pouvez maintenant vous connecter.'
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.unscoped().findOne({ where: { email } });

    if (!user) {
      return next(new AppError('Aucun compte trouvé avec cette adresse email', 404));
    }

    if (!user.isEmailConfirmed) {
      return next(new AppError('Veuillez d\'abord confirmer votre adresse email', 400));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validate: false });

    try {
      await emailService.sendPasswordReset(user, resetToken);
      res.status(200).json({
        status: 'success',
        message: 'Email de réinitialisation envoyé !'
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiry = undefined;
      await user.save({ validate: false });
      return next(new AppError('Erreur lors de l\'envoi de l\'email. Veuillez réessayer.', 500));
    }
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.unscoped().findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return next(new AppError('Lien de réinitialisation invalide ou expiré', 400));
    }

    const { password, passwordConfirm } = req.body;

    if (password !== passwordConfirm) {
      return next(new AppError('Les mots de passe ne correspondent pas', 400));
    }

    validatePassword(password);

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();

    await emailService.sendPasswordChanged(user);

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

const resendConfirmation = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.unscoped().findOne({
      where: {
        email,
        isEmailConfirmed: false
      }
    });

    if (!user) {
      return next(new AppError('Compte introuvable ou déjà confirmé', 404));
    }

    const confirmationToken = user.createConfirmationToken();
    await user.save({ validate: false });

    try {
      await emailService.sendEmailConfirmation(user, confirmationToken);
      res.status(200).json({
        status: 'success',
        message: 'Email de confirmation renvoyé !'
      });
    } catch (error) {
      user.confirmationToken = undefined;
      user.confirmationTokenExpiry = undefined;
      await user.save({ validate: false });
      return next(new AppError('Erreur lors de l\'envoi de l\'email. Veuillez réessayer.', 500));
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  confirmEmail,
  forgotPassword,
  resetPassword,
  logout,
  resendConfirmation
};