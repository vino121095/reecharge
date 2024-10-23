const express = require('express');
const { planValidator } = require('../helpers/planListValidator');
const planListController = require('../controllers/planListController'); // Import the controller correctly

const router = express.Router();

// Create a new plan
router.post('/plan_list', planValidator, planListController.createPlan); // Changed '/plan_list' to '/' for cleaner URL

// Get all plans
router.get('/plan_list', planListController.getAllPlans); // Changed '/plan_list' to '/' for cleaner URL

// Get a plan by ID
router.get('/plan_list/:id', planListController.getPlanById); // Changed '/plan_list/:id' to '/:id' for cleaner URL

// Update a plan by ID
router.put('/plan_list/:id', planValidator, planListController.updatePlan); // Changed '/plan_list/:id' to '/:id' for cleaner URL

// Delete a plan by ID
router.delete('/plan_list/:id', planListController.deletePlan); // Changed '/plan_list/:id' to '/:id' for cleaner URL

module.exports = router;
