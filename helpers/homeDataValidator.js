const { body, validationResult } = require('express-validator');
 
const homeDataValidator = [
    body('plan_type')
        .isIn(['Prepaid', 'Postpaid'])
        .withMessage('Plan type must be either Prepaid or Postpaid.'),
    body('mobile_number')
        .isNumeric()
        .withMessage('Mobile number must be numeric.')
        .isLength({ min: 10, max: 15 })
        .withMessage('Mobile number must be between 10 to 15 digits.'),
    body('operator')
        .notEmpty()
        .withMessage('Operator is required.'),
];
 
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
 
module.exports = {
    homeDataValidator,
    validate,
};
 