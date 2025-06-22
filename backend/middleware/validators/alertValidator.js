const { body, validationResult } = require('express-validator');
const AppError = require('../../utils/appError');

const validateAlert = [
  body('type')
    .isIn(['price_drop', 'back_in_stock', 'new_product', 'low_stock'])
    .withMessage('Type d\'alerte invalide'),
  
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('ID de catégorie invalide'),
  
  body('productId')
    .optional()
    .isUUID()
    .withMessage('ID de produit invalide'),
  
  body('enabled')
    .optional()
    .isBoolean()
    .withMessage('Le champ enabled doit être un booléen'),
  
  body('frequency')
    .optional()
    .isIn(['immediate', 'daily', 'weekly'])
    .withMessage('Fréquence invalide'),
  
  body('threshold')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le seuil doit être un nombre entier positif'),
  
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Date d\'expiration invalide'),
  
  // Custom validation
  body().custom((value) => {
    if (!value.categoryId && !value.productId) {
      throw new Error('Vous devez spécifier une catégorie ou un produit');
    }
    if (value.categoryId && value.productId) {
      throw new Error('Vous ne pouvez pas spécifier à la fois une catégorie et un produit');
    }
    
    // Validate threshold for low_stock alerts
    if (value.type === 'low_stock' && !value.threshold) {
      throw new Error('Le seuil est requis pour les alertes de stock faible');
    }
    
    // Validate that only product alerts can have low_stock type
    if (value.type === 'low_stock' && !value.productId) {
      throw new Error('Les alertes de stock faible ne sont disponibles que pour des produits spécifiques');
    }
    
    // Validate that new_product alerts are only for categories
    if (value.type === 'new_product' && !value.categoryId) {
      throw new Error('Les alertes de nouveaux produits ne sont disponibles que pour des catégories');
    }
    
    return true;
  }),
  
  // Middleware to check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return next(new AppError(errorMessages.join(', '), 400));
    }
    next();
  }
];

module.exports = {
  validateAlert
};