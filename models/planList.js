const { Sequelize } = require('sequelize');
const db = require('../config/db.js');
const { DataTypes } = Sequelize;

const PlanList = db.define('PlanList', {
  pid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  operator: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  plan_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  data: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cells: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  validity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  old_price: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  new_price: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  extra_features: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: '0',
  },
}, {
  tableName: 'plan_list',
  timestamps: true,
});

module.exports = PlanList;
