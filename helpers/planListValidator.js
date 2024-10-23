const { body, validationResult } = require('express-validator');

// Validator for PlanList creation
const planValidator = [
  body('operator')
    .notEmpty().withMessage('Operator field is required')
    .isString().withMessage('Operator must be a string'),

  body('type')
    .notEmpty().withMessage('Type field is required')
    .isString().withMessage('Type must be a string'),

  body('plan_name')
    .notEmpty().withMessage('Plan name is required')
    .isString().withMessage('Plan name must be a string'),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isString().withMessage('Category must be a string'),

  body('data')
    .notEmpty().withMessage('Data is required')
    .isString().withMessage('Data must be a string'),

  body('cells')
    .notEmpty().withMessage('Cells are required')
    .isString().withMessage('Cells must be a string'),

  body('validity')
    .notEmpty().withMessage('Validity is required')
    .isString().withMessage('Validity must be a string'),

  body('old_price')
    .notEmpty().withMessage('Old price is required')
    .isNumeric().withMessage('Old price must be a numeric value'),

  body('new_price')
    .notEmpty().withMessage('New price is required')
    .isNumeric().withMessage('New price must be a numeric value'),

  body('extra_features')
    .notEmpty().withMessage('Extra features are required')
    .isString().withMessage('Extra features must be a string'),

  body('role')
    .optional()
    .isString().withMessage('Role must be a string'),

  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg
        })),
      });
    }
    next();
  }
];

module.exports = { planValidator };
