const { body, validationResult } = require('express-validator');

// Validator for Add_Category creation
const addCategoryValidator = [
  body('add_category')
    .notEmpty().withMessage('Category name is required')
    .isString().withMessage('Category name must be a string')
    .isLength({ max: 255 }).withMessage('Category name must not exceed 255 characters'),

  body('role')
    .optional()
    .isString().withMessage('Role must be a string')
    .isIn(['0', '1']).withMessage('Role must be either "0" or "1"'), // Modify this if your roles are different

  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { addCategoryValidator };
