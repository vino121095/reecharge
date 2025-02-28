const { Sequelize } = require('sequelize');
const db = require('../config/db.js');
const { DataTypes } = Sequelize;
const PlanList = require('./planList');
const Feature = require('./feature');

const PlanFeature = db.define('PlanFeature', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  plan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: PlanList,
      key: 'pid', // assuming 'pid' is the primary key in PlanList model
    }
  },
  feature_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Feature,
      key: 'f_id', // matching your Feature model primary key
    }
  }
}, {
  tableName: 'plan_features',
  timestamps: false, // Set to true if you have created_at and updated_at columns
});

// Define associations
PlanFeature.belongsTo(PlanList, { foreignKey: 'plan_id' });
PlanFeature.belongsTo(Feature, { foreignKey: 'feature_id' });

// Optional: Define the reverse associations if needed
PlanList.hasMany(PlanFeature, { foreignKey: 'plan_id' });
Feature.hasMany(PlanFeature, { foreignKey: 'feature_id' });

module.exports = PlanFeature;