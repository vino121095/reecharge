const { Sequelize } = require('sequelize');
const db = require('../config/db.js');
const { DataTypes } = Sequelize;

const Admin = db.define('Admin', {
  aid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true, 
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: '0',
  },
}, {
  tableName: 'admin_users',
  timestamps: true,
});

module.exports = Admin;
