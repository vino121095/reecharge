const { Sequelize } = require('sequelize');
const db = require('../config/db.js');
const { DataTypes } = Sequelize;

const Operator = db.define('Operator', {
  oid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  operator: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: '0', 
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'operators',
  timestamps: true, 
});

module.exports = Operator;