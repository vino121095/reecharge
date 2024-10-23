const { Sequelize } = require('sequelize');
const db = require('../config/db.js');
const { DataTypes } = Sequelize;
 
const User = db.define('User', {
  uid: {
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
  // resetToken: {
  //   type: DataTypes.STRING,
  //   allowNull: true,
  // },
  // resetTokenExpiry: {
  //   type: DataTypes.DATE,
  //   allowNull: true,
  // },
}, {
  tableName: 'users',
  timestamps: true,
});
 
module.exports = User;
 
