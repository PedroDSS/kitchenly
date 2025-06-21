const { body, validationResult } = require('express-validator');
const AppError = require('../../utils/appError');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new AppError(errorMessages.join('. '), 400));
  }
  next();
};

exports.validateOrder = {
  create: [
    body('deliveryOptionId')
      .notEmpty().withMessage('Delivery option is required')
      .isInt().withMessage('Invalid delivery option ID'),
    
    body('deliveryAddress')
      .notEmpty().withMessage('Delivery address is required')
      .isObject().withMessage('Delivery address must be an object'),
    
    body('deliveryAddress.street')
      .notEmpty().withMessage('Street address is required')
      .isString().withMessage('Street must be a string'),
    
    body('deliveryAddress.city')
      .notEmpty().withMessage('City is required')
      .isString().withMessage('City must be a string'),
    
    body('deliveryAddress.postalCode')
      .notEmpty().withMessage('Postal code is required')
      .matches(/^[0-9]{5}$/).withMessage('Invalid postal code format'),
    
    body('deliveryAddress.country')
      .notEmpty().withMessage('Country is required')
      .isString().withMessage('Country must be a string'),
    
    body('deliveryAddress.firstName')
      .notEmpty().withMessage('First name is required')
      .isString().withMessage('First name must be a string'),
    
    body('deliveryAddress.lastName')
      .notEmpty().withMessage('Last name is required')
      .isString().withMessage('Last name must be a string'),
    
    body('deliveryAddress.phone')
      .optional()
      .matches(/^(\+33|0)[1-9]([0-9]{8})$/).withMessage('Invalid phone number format'),
    
    body('billingAddress')
      .optional()
      .isObject().withMessage('Billing address must be an object'),
    
    body('promoCode')
      .optional()
      .isString().withMessage('Promo code must be a string')
      .trim()
      .toUpperCase(),
    
    body('notes')
      .optional()
      .isString().withMessage('Notes must be a string')
      .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
    
    body('saveAddresses')
      .optional()
      .isBoolean().withMessage('Save addresses must be a boolean'),
    
    handleValidationErrors
  ],

  return: [
    body('reason')
      .notEmpty().withMessage('Return reason is required')
      .isString().withMessage('Reason must be a string')
      .isLength({ min: 10, max: 500 }).withMessage('Reason must be between 10 and 500 characters'),
    
    body('items')
      .optional()
      .isArray().withMessage('Items must be an array'),
    
    body('items.*.orderItemId')
      .optional()
      .isInt().withMessage('Order item ID must be an integer'),
    
    body('items.*.quantity')
      .optional()
      .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    
    handleValidationErrors
  ]
};