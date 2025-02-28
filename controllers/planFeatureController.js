const PlanFeature = require('../models/planFeature');
const Feature = require('../models/feature');
const PlanList = require('../models/planList');
const { Op } = require('sequelize');

// Get all features for a specific plan
const getPlanFeaturesByPlanId = async (req, res) => {
  try {
    const planId = req.params.planId;
    
    // Check if plan exists
    const plan = await PlanList.findByPk(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Get all plan features with associated feature details
    const planFeatures = await PlanFeature.findAll({
      where: {
        plan_id: planId
      },
      include: [
        {
          model: Feature,
          attributes: ['f_id', 'feature_name', 'image_path']
        }
      ]
    });

    // If no features found for the plan
    if (planFeatures.length === 0) {
      return res.status(200).json({ 
        message: 'No features found for this plan', 
        data: [] 
      });
    }

    // Return the plan features
    return res.status(200).json({
      message: 'Plan features retrieved successfully',
      data: planFeatures
    });
  } catch (error) {
    console.error("Error fetching plan features:", error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// Get all plan IDs that have a specific feature
const getPlansByFeatureId = async (req, res) => {
  try {
    const featureId = req.params.featureId;
    
    // Check if feature exists
    const feature = await Feature.findByPk(featureId);
    if (!feature) {
      return res.status(404).json({ message: 'Feature not found' });
    }

    // Find all plan_features with the given feature_id
    const planFeatures = await PlanFeature.findAll({
      where: {
        feature_id: featureId
      },
      include: [
        {
          model: PlanList,
          attributes: ['pid', 'plan_name', 'operator', 'category', 'new_price']
        }
      ]
    });

    // Extract the plan data
    const plans = planFeatures.map(pf => pf.PlanList);

    return res.status(200).json({
      message: 'Plans with specified feature retrieved successfully',
      data: plans
    });
  } catch (error) {
    console.error("Error fetching plans by feature:", error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// Add a feature to a plan
const addFeatureToPlan = async (req, res) => {
  try {
    const { plan_id, feature_id } = req.body;
    
    // Check if both plan and feature exist
    const plan = await PlanList.findByPk(plan_id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    const feature = await Feature.findByPk(feature_id);
    if (!feature) {
      return res.status(404).json({ message: 'Feature not found' });
    }
    
    // Check if the relationship already exists
    const existingRelation = await PlanFeature.findOne({
      where: {
        plan_id,
        feature_id
      }
    });
    
    if (existingRelation) {
      return res.status(400).json({ 
        message: 'This feature is already associated with the plan' 
      });
    }
    
    // Create new relationship
    const newPlanFeature = await PlanFeature.create({
      plan_id,
      feature_id
    });
    
    // Update the extra_features field in the plan
    const featureName = feature.feature_name;
    let extraFeatures = plan.extra_features ? plan.extra_features.split(', ') : [];
    
    if (!extraFeatures.includes(featureName)) {
      extraFeatures.push(featureName);
      await plan.update({
        extra_features: extraFeatures.join(', ')
      });
    }
    
    return res.status(201).json({
      message: 'Feature added to plan successfully',
      data: newPlanFeature
    });
  } catch (error) {
    console.error("Error adding feature to plan:", error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// Remove a feature from a plan
const removeFeatureFromPlan = async (req, res) => {
  try {
    const { plan_id, feature_id } = req.body;
    
    // Check if the relationship exists
    const planFeature = await PlanFeature.findOne({
      where: {
        plan_id,
        feature_id
      }
    });
    
    if (!planFeature) {
      return res.status(404).json({ 
        message: 'This feature is not associated with the plan' 
      });
    }
    
    // Get the feature and plan details
    const feature = await Feature.findByPk(feature_id);
    const plan = await PlanList.findByPk(plan_id);
    
    // Delete the relationship
    await planFeature.destroy();
    
    // Update the extra_features field in the plan
    if (feature && plan && plan.extra_features) {
      const featureName = feature.feature_name;
      let extraFeatures = plan.extra_features.split(', ');
      extraFeatures = extraFeatures.filter(f => f !== featureName);
      
      await plan.update({
        extra_features: extraFeatures.join(', ')
      });
    }
    
    return res.status(200).json({
      message: 'Feature removed from plan successfully'
    });
  } catch (error) {
    console.error("Error removing feature from plan:", error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// Get all plan features (for admin purposes)
const getAllPlanFeatures = async (req, res) => {
  try {
    const planFeatures = await PlanFeature.findAll({
      include: [
        {
          model: PlanList,
          attributes: ['pid', 'plan_name', 'operator']
        },
        {
          model: Feature,
          attributes: ['f_id', 'feature_name', 'image_path']
        }
      ]
    });
    
    return res.status(200).json({
      message: 'All plan features retrieved successfully',
      data: planFeatures
    });
  } catch (error) {
    console.error("Error fetching all plan features:", error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

module.exports = {
  getPlanFeaturesByPlanId,
  getPlansByFeatureId,
  addFeatureToPlan,
  removeFeatureFromPlan,
  getAllPlanFeatures
};