// routes/featureRoutes.js
const express = require('express');
const router = express.Router();
const featureController = require('../controllers/featureController');

// POST - Add a new feature (with image upload)
router.post('/features', featureController.uploadFeatureImage, featureController.addFeature);

// GET all features
router.get('/features', featureController.getAllFeatures);

// GET features by name match
router.get('/features/name/:name', featureController.getFeaturesByName);

// The route order matters! More specific routes should come before generic ones
// GET feature image by filename
router.get('/features/image/:filename', featureController.getFeatureImage);

// GET single feature by ID
router.get('/features/:id', featureController.getFeatureById);

// Add a static file route for direct access to uploads
router.get('/uploads/*', featureController.serveStaticImage);

module.exports = router;