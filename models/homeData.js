const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const HomeData = sequelize.define('home_data', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    mobile_number: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    operator: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    plan_type: {  // Added field
        type: DataTypes.ENUM('Prepaid', 'Postpaid'),
        allowNull: false
    },
    plan_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'plan_list',
            key: 'pid'
        }
    },
    plan_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    old_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'paid'),
        allowNull: true,
        defaultValue: 'pending'
    },
    payment_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    user_payment_datetime: {  // New column added
        type: DataTypes.DATE,
        allowNull: true
    },
    transaction_id: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    emp_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    screenshot_path: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    screenshot_uploaded_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'home_data',
    timestamps: false,
    underscored: true,
});

// Define associations if needed
HomeData.associate = (models) => {
    HomeData.belongsTo(models.PlanList, {
        foreignKey: 'plan_id',
        as: 'plan'
    });
    
    // If you want to associate with an Employee model
    if (models.Employee) {
        HomeData.belongsTo(models.Employee, {
            foreignKey: 'emp_id',
            as: 'employee'
        });
    }
};

module.exports = HomeData;