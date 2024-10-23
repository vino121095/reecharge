const express = require('express');
const { addCategoryValidator } = require('../helpers/addCategoryValidator');
const { createCategory, getAllCategories, updateCategory } = require('../controllers/addCategoryController');

const router = express.Router();

// Create a new category
router.post('/add_category', addCategoryValidator, createCategory);

// Get all categories
router.get('/add_category', getAllCategories);

// Update an existing category by ID
router.put('/add_category/:id', addCategoryValidator, updateCategory);

module.exports = router;
