const express = require('express');
const router = express.Router();
const planFeatureController = require('../controllers/planFeatureController');

// Get features for a specific plan
router.get('/plan/:planId', planFeatureController.getPlanFeaturesByPlanId);

// Get plans that have a specific feature
router.get('/feature/:featureId', planFeatureController.getPlansByFeatureId);

// Get all plan-feature associations (admin route)
router.get('/', planFeatureController.getAllPlanFeatures);

// Add a feature to a plan
router.post('/', planFeatureController.addFeatureToPlan);

// Remove a feature from a plan
router.delete('/', planFeatureController.removeFeatureFromPlan);

module.exports = router;