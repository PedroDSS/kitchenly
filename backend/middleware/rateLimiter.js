const rateLimit = require('express-rate-limit');
const AppError = require('../utils/appError');

const createRateLimiter = (options = {}) => {
  const defaults = {
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
      next(new AppError('Trop de requêtes depuis cette adresse IP, veuillez réessayer plus tard.', 429));
    },
    keyGenerator: (req) => {
      return req.headers['x-forwarded-for']?.split(',')[0] || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress || 
             req.ip;
    },
    skip: (req) => {
      if (process.env.NODE_ENV === 'development' && req.headers['x-skip-rate-limit']) {
        return true;
      }
      return false;
    }
  };

  return rateLimit({ ...defaults, ...options });
};

const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Trop de requêtes, veuillez réessayer dans 15 minutes.'
});

const strictLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: false
});

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: false,
  message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.'
});

const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  skipSuccessfulRequests: false,
  message: 'Trop de demandes de réinitialisation, veuillez réessayer dans 1 heure.'
});

const emailLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: false,
  message: 'Trop d\'emails envoyés, veuillez réessayer dans 1 heure.'
});

const apiLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: 'Limite d\'API dépassée, veuillez réessayer dans 1 minute.'
});

const createAccountLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  skipSuccessfulRequests: false,
  message: 'Trop de créations de compte depuis cette adresse IP, veuillez réessayer dans 1 heure.'
});

module.exports = {
  createRateLimiter,
  generalLimiter,
  strictLimiter,
  authLimiter,
  passwordResetLimiter,
  emailLimiter,
  apiLimiter,
  createAccountLimiter
};