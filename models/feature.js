const { Sequelize } = require('sequelize');
const db = require('../config/db.js');
const { DataTypes } = Sequelize;

const Feature = db.define('Feature', {
  f_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  feature_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  image_path: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  tableName: 'features',
  timestamps: false,
});

module.exports = Feature;