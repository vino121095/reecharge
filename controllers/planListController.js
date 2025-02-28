const PlanList = require('../models/planList');
const Feature = require('../models/feature');
const PlanFeature = require('../models/planFeature');
const { Op } = require('sequelize');
const db = require('../config/db.js');

// Create a new plan
const createPlan = async (req, res) => {
  // Start a transaction
  const transaction = await db.transaction();
  
  try {
    // Check if plan with the same name already exists
    const existingPlan = await PlanList.findOne({ 
      where: { plan_name: req.body.plan_name },
      transaction
    });

    if (existingPlan) {
      // If plan name already exists, return an error message
      await transaction.rollback();
      return res.status(400).json({ message: 'Plan with this name already exists. Please choose a different name.' });
    }

    // Process extra_features to ensure it's properly formatted
    let extraFeaturesText = req.body.extra_features;
    let extraFeatures = [];
    
    if (Array.isArray(extraFeaturesText)) {
      // If it's an array, join it with commas
      extraFeaturesText = extraFeaturesText.join(', ');
      extraFeatures = extraFeaturesText.split(', ');
    } else if (typeof extraFeaturesText === 'string') {
      extraFeatures = extraFeaturesText.split(', ').map(feature => feature.trim()).filter(Boolean);
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
      extra_features: extraFeaturesText,
      role: req.body.role || '0',
    }, { transaction });

    // If there are features to link, find matching features and create relationships
    if (extraFeatures.length > 0 && extraFeatures[0] !== 'No Extra Feature') {
      // Get all matching features from database
      const features = await Feature.findAll({
        where: {
          feature_name: {
            [Op.in]: extraFeatures
          }
        },
        transaction
      });

      // Create entries in the linking table
      const planFeaturePromises = features.map(feature => {
        return PlanFeature.create({
          plan_id: newPlan.pid,
          feature_id: feature.f_id
        }, { transaction });
      });

      await Promise.all(planFeaturePromises);
    }

    // Commit transaction
    await transaction.commit();

    return res.status(201).json({ message: 'Plan created successfully', data: newPlan });
  } catch (error) {
    // Rollback transaction in case of error
    await transaction.rollback();
    console.error("Error creating plan:", error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get all plans
const getAllPlans = async (req, res) => {
  try {
    const plans = await PlanList.findAll({
      include: [
        {
          model: PlanFeature,
          include: [
            {
              model: Feature,
              attributes: ['f_id', 'feature_name', 'image_path']
            }
          ]
        }
      ]
    });
    return res.status(200).json({ message: 'Plans retrieved successfully', data: plans });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get a single plan by ID
const getPlanById = async (req, res) => {
  try {
    const plan = await PlanList.findByPk(req.params.id, {
      include: [
        {
          model: PlanFeature,
          include: [
            {
              model: Feature,
              attributes: ['f_id', 'feature_name', 'image_path']
            }
          ]
        }
      ]
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    return res.status(200).json({ message: 'Plan retrieved successfully', data: plan });
  } catch (error) {
    console.error("Error fetching plan:", error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update a plan by ID
const updatePlan = async (req, res) => {
  // Start a transaction
  const transaction = await db.transaction();
  
  try {
    const plan = await PlanList.findByPk(req.params.id, { transaction });

    if (!plan) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Process extra_features to ensure it's properly formatted
    let extraFeaturesText = req.body.extra_features;
    let extraFeatures = [];
    
    if (Array.isArray(extraFeaturesText)) {
      // If it's an array, join it with commas
      extraFeaturesText = extraFeaturesText.join(', ');
      extraFeatures = extraFeaturesText.split(', ');
    } else if (typeof extraFeaturesText === 'string') {
      extraFeatures = extraFeaturesText.split(', ').map(feature => feature.trim()).filter(Boolean);
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
      extra_features: extraFeaturesText,
      role: req.body.role || '0',
    }, { transaction });

    // Remove existing feature relationships for this plan
    await PlanFeature.destroy({
      where: {
        plan_id: plan.pid
      },
      transaction
    });

    // If there are features to link, find matching features and create relationships
    if (extraFeatures.length > 0 && extraFeatures[0] !== 'No Extra Feature') {
      // Get all matching features from database
      const features = await Feature.findAll({
        where: {
          feature_name: {
            [Op.in]: extraFeatures
          }
        },
        transaction
      });

      // Create entries in the linking table
      const planFeaturePromises = features.map(feature => {
        return PlanFeature.create({
          plan_id: plan.pid,
          feature_id: feature.f_id
        }, { transaction });
      });

      await Promise.all(planFeaturePromises);
    }

    // Commit transaction
    await transaction.commit();

    return res.status(200).json({ message: 'Plan updated successfully', data: updatedPlan });
  } catch (error) {
    // Rollback transaction in case of error
    await transaction.rollback();
    console.error("Error updating plan:", error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Delete a plan by ID
const deletePlan = async (req, res) => {
  // Start a transaction
  const transaction = await db.transaction();
  
  try {
    const plan = await PlanList.findByPk(req.params.id, { transaction });

    if (!plan) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Delete associated plan features first
    await PlanFeature.destroy({
      where: {
        plan_id: plan.pid
      },
      transaction
    });

    // Then delete the plan
    await plan.destroy({ transaction });
    
    // Commit transaction
    await transaction.commit();
    
    return res.status(200).json({ message: 'Plan deleted successfully' });
  } catch (error) {
    // Rollback transaction in case of error
    await transaction.rollback();
    console.error("Error deleting plan:", error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = { createPlan, getAllPlans, getPlanById, updatePlan, deletePlan };