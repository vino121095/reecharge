const { body, validationResult } = require('express-validator');

const validateOperator = [
    body('operator')
        .notEmpty().withMessage('Operator field is required')
        .isString().withMessage('Operator must be a string'),

    body('role')
        .optional()
        .isString().withMessage('Role must be a string'),

    body('image') // This will handle both local file paths and URLs
        .optional()
        .custom((value, { req }) => {
            // If no image is provided, validate that there is an uploaded file
            if (!value && !req.file) {
                throw new Error('An image must be provided (either URL or file upload)');
            }

            // Check if the value is a URL
            const isUrl = value && /^https?:\/\/.+/.test(value);
            // Check if the value is a local file path
            const isLocalPath = value && value.startsWith('uploads/');

            if (!isUrl && !isLocalPath) {
                throw new Error('Image must be a valid URL or a local file path starting with "uploads/"');
            }

            return true;
        }),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

module.exports = { validateOperator };
