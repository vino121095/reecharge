const Operator = require('../models/operator');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Create an 
const createOperator = async (req, res) => {
    try {
        // Check if the file was uploaded
        const imagePath = req.file ? req.file.path : null;

        // Create new operator with image path
        const newOperator = await Operator.create({
            role: req.body.role,
            operator: req.body.operator,
            image: imagePath, // Save the image path to the database
        });

        res.status(201).json({
            message: 'Operator created successfully',
            operator: newOperator,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating operator',
            error: error.message,
        });
    }
};

// Get all Operators
const getOperators = async (req, res) => {
    try {
        const operators = await Operator.findAll(); // Fetch all operators from the database
        res.status(200).json(operators); // Respond with the operators
    } catch (error) {
        console.error('Error fetching operators:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error fetching operators', error: error.message });
    }
};

// Get a single Operator by ID
const getOperatorById = async (req, res) => {
    const operatorId = req.params.id; // Get the ID from the request parameters

    try {
        const operator = await Operator.findByPk(operatorId); // Use the appropriate method to find the operator

        if (!operator) {
            return res.status(404).json({ message: 'Operator not found' });
        }

        res.status(200).json(operator); // Respond with the found operator
    } catch (error) {
        console.error('Error fetching operator by ID:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error fetching operator', error: error.message });
    }
};

// Update an Operator by ID
const updateOperator = async (req, res) => {
    const operatorId = req.params.id; // Get the operator ID from the request parameters
    const { operator, role, image } = req.body; // Destructure the body to get the updated data

    try {
        // Validate operator ID
        if (!operatorId) {
            return res.status(400).json({ message: 'Operator ID is required' });
        }

        // Check if the operator exists
        const existingOperator = await Operator.findByPk(operatorId);
        if (!existingOperator) {
            return res.status(404).json({ message: 'Operator not found' });
        }

        // Update the operator
        const [updated] = await Operator.update(
            { operator, role, image }, // The data you want to update
            { where: { oid: operatorId } } // The condition for the update
        );

        // Check if the operator was updated
        if (updated) {
            const updatedOperator = await Operator.findByPk(operatorId); // Fetch the updated operator to return
            return res.status(200).json({ message: 'Operator updated successfully', operator: updatedOperator });
        } else {
            return res.status(404).json({ message: 'Operator not found or no changes made' }); // If no operator was updated
        }
    } catch (error) {
        console.error('Error updating operator:', error); // Log the error for debugging
        return res.status(500).json({ message: 'Error updating operator', error: error.message });
    }
};

// Delete an Operator by ID
const deleteOperator = async (req, res) => {
    const operatorId = req.params.id;

    console.log('Attempting to delete operator with ID:', operatorId);

    try {
        if (!operatorId) {
            return res.status(400).json({ message: 'Operator ID is required' });
        }

        const deleted = await Operator.destroy({
            where: { oid: operatorId }
        });

        if (deleted) {
            return res.status(200).json({ message: 'Operator deleted successfully' });
        } else {
            return res.status(404).json({ message: 'Operator not found' });
        }
    } catch (error) {
        console.error('Error deleting operator:', error);
        console.error('Full error stack:', error.stack);
        return res.status(500).json({ message: 'Error deleting operator', error: error.message });
    }
};


module.exports = {
    createOperator,
    getOperators,
    getOperatorById,
    updateOperator,
    deleteOperator
}
