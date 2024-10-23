const { Sequelize } = require('sequelize');
const db = require('../config/db.js');
const { DataTypes } = Sequelize;
 
const HomeData = db.define('HomeData', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    plan_type: {
        type: DataTypes.ENUM('Prepaid', 'Postpaid'),
        allowNull: false,
    },
    mobile_number: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isNumeric: true,
            len: [10, 15],
        },
    },
    operator: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'home_data',
    timestamps: true,
});
 
module.exports = HomeData;
 