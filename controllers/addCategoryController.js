const Add_Category = require('../models/addCategory'); // Adjust the path according to your structure

// Create a new category
const createCategory = async (req, res) => {
  try {
    // Create a new category using the data from the request body
    const newCategory = await Add_Category.create({
      add_category: req.body.add_category,
      role: req.body.role || '0', // Use default value if not provided
    });

    return res.status(201).json({
      message: 'Category created successfully',
      data: newCategory,
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Add_Category.findAll(); // Fetch all categories from the database

    return res.status(200).json({
      message: 'Categories retrieved successfully',
      data: categories,
    });
  } catch (error) {
    console.error('Error retrieving categories:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Update a category by ID
const updateCategory = async (req, res) => {
    const { id } = req.params; // Get the ID from the request parameters
    const { add_category } = req.body; // Get the updated category data from the request body
  
    try {
      const [updated] = await Add_Category.update({ add_category }, {
        where: { cid: id }, // Use the primary key (cid) to find the category
      });
  
      if (updated) {
        const updatedCategory = await Add_Category.findOne({ where: { cid: id } });
        return res.status(200).json({ category: updatedCategory });
      }
  
      return res.status(404).json({ message: 'Category not found' });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating category', error });
    }
  };

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory
};
