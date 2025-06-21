const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('../utils/appError');
const { User } = require('../models');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.scope('defaultScope').findByPk(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }

    if (currentUser.isAccountLocked()) {
      return next(
        new AppError('Your account is locked. Please try again later.', 423)
      );
    }

    if (!currentUser.isEmailConfirmed) {
      return next(
        new AppError('Please confirm your email address to access this resource.', 401)
      );
    }

    if (currentUser.isPasswordExpired()) {
      return next(
        new AppError('Your password has expired. Please reset your password.', 401)
      );
    }

    if (currentUser.passwordChangedAt) {
      const changedTimestamp = parseInt(
        currentUser.passwordChangedAt.getTime() / 1000,
        10
      );

      if (decoded.iat < changedTimestamp) {
        return next(
          new AppError(
            'User recently changed password! Please log in again.',
            401
          )
        );
      }
    }

    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again!', 401));
    } else if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired! Please log in again.', 401));
    }
    return next(error);
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    const userRoles = req.user.roles || [];
    const hasRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next();
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await User.scope('defaultScope').findByPk(decoded.id);
    
    if (currentUser && !currentUser.isAccountLocked() && currentUser.isEmailConfirmed) {
      req.user = currentUser;
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  signToken,
  createSendToken,
  protect,
  restrictTo,
  optionalAuth
};