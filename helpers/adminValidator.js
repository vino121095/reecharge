const { body } = require('express-validator');

const adminValidator = [
    body('email').isEmail().withMessage('Email is required and must be valid.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
];

const adminLoginValidator = [
    body('email').isEmail().withMessage('Email is required and must be valid.'),
    body('password').exists().withMessage('Password is required.'),
];

module.exports = {
    adminValidator,
    adminLoginValidator,
};
