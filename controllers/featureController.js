// controllers/featureController.js
const Feature = require('../models/feature');
const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');
const multer = require('multer');
const PlanFeature = require('../models/planFeature');
const PlanList = require('../models/planList');

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = './uploads';
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Create a unique filename with timestamp
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// Initialize multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Add a new feature
exports.addFeature = async (req, res) => {
  try {
    // Upload is handled by multer middleware before this controller runs
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an image file'
      });
    }
    
    if (!req.body.feature_name) {
      // Remove uploaded file if feature name is missing
      fs.unlinkSync(path.join('./uploads', req.file.filename));
      
      return res.status(400).json({
        success: false,
        error: 'Feature name is required'
      });
    }
    
    // Create a new feature - store only the filename in the database
    const feature = await Feature.create({
      feature_name: req.body.feature_name,
      image_path: `${req.file.filename}` // Store direct path to file
    });
    
    return res.status(201).json({
      success: true,
      data: feature,
      message: 'Feature added successfully'
    });
  } catch (error) {
    console.error('Error adding feature:', error);
    
    // Clean up - remove uploaded file if database operation failed
    if (req.file) {
      fs.unlinkSync(path.join('./uploads', req.file.filename));
    }
    
    return res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};

// Multer middleware handler for single file upload
exports.uploadFeatureImage = upload.single('image');

// Get all features
exports.getAllFeatures = async (req, res) => {
  try {
    const features = await Feature.findAll();
    
    return res.status(200).json({
      success: true,
      count: features.length,
      data: features
    });
  } catch (error) {
    console.error('Error fetching features:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get a single feature
exports.getFeatureById = async (req, res) => {
  try {
    const feature = await Feature.findByPk(req.params.id);
    
    if (!feature) {
      return res.status(404).json({
        success: false,
        error: 'Feature not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: feature
    });
  } catch (error) {
    console.error('Error fetching feature:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get features by name match
exports.getFeaturesByName = async (req, res) => {
  try {
    const { name } = req.params;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Feature name parameter is required'
      });
    }
    
    const features = await Feature.findAll({
      where: {
        feature_name: {
          [Sequelize.Op.like]: `%${name}%`
        }
      }
    });
    
    return res.status(200).json({
      success: true,
      count: features.length,
      data: features
    });
  } catch (error) {
    console.error('Error fetching features by name:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get feature image
exports.getFeatureImage = async (req, res) => {
  try {
    const imageFilename = req.params.filename;
    
    // Resolve full path - adjust this based on your server setup
    const uploadDir = path.resolve('./uploads');
    const fullPath = path.join(uploadDir, imageFilename);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.error(`Image file not found: ${fullPath}`);
      return res.status(404).json({ message: 'Image file not found' });
    }
    
    // Send the image file
    return res.sendFile(fullPath);
    
  } catch (error) {
    console.error("Error fetching feature image:", error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// Serve static files from uploads directory
exports.serveStaticImage = (req, res) => {
  try {
    const imagePath = req.params[0]; // Will capture everything after /uploads/
    const fullPath = path.join('./uploads', imagePath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.error(`Static image not found: ${fullPath}`);
      return res.status(404).json({ message: 'Image file not found' });
    }
    
    // Send the file
    return res.sendFile(path.resolve(fullPath));
  } catch (error) {
    console.error("Error serving static image:", error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.deleteFeature = async (req, res) => {
  try {
    // Find the feature first to get the image path
    const feature = await Feature.findByPk(req.params.id);
    
    if (!feature) {
      return res.status(404).json({
        success: false,
        error: 'Feature not found'
      });
    }

    // Get all plans using this feature
    const planFeatures = await PlanFeature.findAll({
      where: {
        feature_id: feature.f_id
      },
      include: [
        {
          model: PlanList,
          attributes: ['pid', 'plan_name', 'extra_features']
        }
      ]
    });

    // Update each plan's extra_features by removing this feature
    for (const planFeature of planFeatures) {
      const plan = planFeature.PlanList;
      if (plan.extra_features) {
        const features = plan.extra_features.split(', ');
        const updatedFeatures = features.filter(f => f !== feature.feature_name);
        await plan.update({
          extra_features: updatedFeatures.join(', ')
        });
      }
    }

    // Delete all plan_features entries for this feature
    await PlanFeature.destroy({
      where: {
        feature_id: feature.f_id
      }
    });

    // Store the image path before deleting the database record
    const imagePath = feature.image_path;
    
    // Delete the feature from database
    await feature.destroy();
    
    // Delete the associated image file if it exists
    if (imagePath) {
      const fullPath = path.join('./uploads', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      } else {
        console.warn(`Image file not found during deletion: ${fullPath}`);
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Feature deleted successfully and removed from all associated plans'
    });
  } catch (error) {
    console.error('Error deleting feature:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};
