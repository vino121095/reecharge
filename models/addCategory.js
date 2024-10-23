const { Sequelize } = require('sequelize');
const db = require('../config/db.js');
const { DataTypes } = Sequelize;

const Add_Category = db.define('Add_Category', {
  cid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  add_category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: '0', 
  },
}, {
  tableName: 'add_category',
  timestamps: true, 
});

module.exports = Add_Category;
