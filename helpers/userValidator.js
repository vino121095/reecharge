const { body } = require('express-validator');
 
// Define your validators
const registerValidator = [
  body('name').notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Invalid email format.'),
  body('phone').notEmpty().withMessage('Phone number is required.'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  body('confirm_password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match.');
      }
      return true;
    }),
];
 
const loginValidator = [
  body('email').isEmail().withMessage('Invalid email format.'),
  body('password').notEmpty().withMessage('Password is required.'),
];
 
// const forgotPasswordValidator = [
//   body('email').isEmail().withMessage('Enter a valid email address'),
// ];
 
// // Reset password validation
// const resetPasswordValidator = [
//   body('token').notEmpty().withMessage('Token is required'),
//   body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
// ];
 
// Validation result middleware
// const validate = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//   }
//   next();
// };
 
module.exports = { registerValidator, loginValidator };