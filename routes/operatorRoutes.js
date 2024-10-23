const express = require('express');
const router = express.Router();
const { validateOperator } = require('../helpers/operatorValidator');
const operatorController = require('../controllers/operatorController');
const upload = require('../config/multerConfig.js');

// creating an operator
router.post('/operators', upload.single('image'), operatorController.createOperator);

// Get all Operators
router.get('/operators', operatorController.getOperators);

// Get a single Operator by ID
router.get('/operators/:id', operatorController.getOperatorById);

// Update an Operator by ID
router.put('/operators/:id', validateOperator, operatorController.updateOperator);

// Delete an Operator by ID
router.delete('/operators/:id', operatorController.deleteOperator);

module.exports = router;