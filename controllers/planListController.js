const PlanList = require('../models/planList');

// Create a new plan
const createPlan = async (req, res) => {
    try {
      // Check if plan with the same name already exists
      const existingPlan = await PlanList.findOne({ where: { plan_name: req.body.plan_name } });
  
      if (existingPlan) {
        // If plan name already exists, return an error message
        return res.status(400).json({ message: 'Plan with this name already exists. Please choose a different name.' });
      }
  
      // If no duplicate found, create a new plan
      const newPlan = await PlanList.create({
        operator: req.body.operator,
        type: req.body.type,
        plan_name: req.body.plan_name,
        category: req.body.category,
        data: req.body.data,
        cells: req.body.cells,
        validity: req.body.validity,
        old_price: req.body.old_price,
        new_price: req.body.new_price,
        extra_features: req.body.extra_features,
        role: req.body.role || '0',
      });
  
      return res.status(201).json({ message: 'Plan created successfully', data: newPlan });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };
// Get all plans
const getAllPlans = async (req, res) => {
  try {
    const plans = await PlanList.findAll();
    return res.status(200).json({ message: 'Plans retrieved successfully', data: plans });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get a single plan by ID
const getPlanById = async (req, res) => {
  try {
    const plan = await PlanList.findByPk(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    return res.status(200).json({ message: 'Plan retrieved successfully', data: plan });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update a plan by ID
const updatePlan = async (req, res) => {
  try {
    const plan = await PlanList.findByPk(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const updatedPlan = await plan.update({
      operator: req.body.operator,
      type: req.body.type,
      plan_name: req.body.plan_name,
      category: req.body.category,
      data: req.body.data,
      cells: req.body.cells,
      validity: req.body.validity,
      old_price: req.body.old_price,
      new_price: req.body.new_price,
      extra_features: req.body.extra_features,
      role: req.body.role || '0',
    });

    return res.status(200).json({ message: 'Plan updated successfully', data: updatedPlan });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Delete a plan by ID
const deletePlan = async (req, res) => {
  try {
    const plan = await PlanList.findByPk(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    await plan.destroy();
    return res.status(200).json({ message: 'Plan deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = { createPlan, getAllPlans, getPlanById, updatePlan, deletePlan };
