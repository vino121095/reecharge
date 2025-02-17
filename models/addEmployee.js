const { Sequelize } = require('sequelize');
const db = require('../config/db.js');
const { DataTypes } = Sequelize;
 
const Employee = db.define('Employee', {
  eid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: '0',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  last_loginat: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // resetToken: {
  //   type: DataTypes.STRING,
  //   allowNull: true,
  // },
  // resetTokenExpiry: {
  //   type: DataTypes.DATE,
  //   allowNull: true,
  // },
}, {
  tableName: 'add_employee',
  timestamps: true,
});
 
module.exports = Employee;
 
