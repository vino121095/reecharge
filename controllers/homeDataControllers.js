const HomeData = require('../models/homeData'); // Adjust path as needed
 const Employee = require('../models/addEmployee');
 const User = require('../models/user');
 const { Op } = require('sequelize');

const createHomeData = async (req, res) => {
    try {
        const homeData = await HomeData.create({
            ...req.body,
            user_payment_datetime:new Date(),
            payment_status: 'pending' // Ensure status is always pending
        });
        return res.status(201).json(homeData);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getAllHomeData = async (req, res) => {
    try {
        const homeDataList = await HomeData.findAll();
        return res.status(200).json(homeDataList);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updatePaymentInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            plan_id,
            plan_name,
            old_price,
            amount,
            payment_status,
            transaction_id 
        } = req.body;

        const [updated] = await HomeData.update({
            plan_id,
            plan_name,
            old_price,
            amount,
            payment_status,
            payment_date: new Date(),
            transaction_id
        }, {
            where: { id }
        });

        if (!updated) {
            return res.status(404).json({ message: 'HomeData record not found' });
        }

        const updatedRecord = await HomeData.findByPk(id);
        return res.status(200).json(updatedRecord);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getAllPendingHomeData = async (req, res) => {
    try {
        const homeDataList = await HomeData.findAll({
            where: {
                payment_status: 'pending'
            }
        });
        return res.status(200).json(homeDataList);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Get all paid home data
const getAllPaidHomeData = async (req, res) => {
    try {
        const homeDataList = await HomeData.findAll({
            where: {
                payment_status: 'paid'
            },
            include: [{
                model: Employee,
                as: 'employee', 
                attributes: ['name', 'last_loginat', 'last_logoutat']
            }]
        });
        return res.status(200).json(homeDataList);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

 
// Get HomeData by ID
const getHomeDataById = async (req, res) => {
    try {
        const homeData = await HomeData.findByPk(req.params.id);
        if (!homeData) {
            return res.status(404).json({ message: 'HomeData not found' });
        }
        return res.status(200).json(homeData);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
 
// // Update HomeData entry
// const updateHomeData = async (req, res) => {
//     try {
//         const [updated] = await HomeData.update(req.body, {
//             where: { id: req.params.id },
//         });
//         if (!updated) {
//             return res.status(404).json({ message: 'HomeData not found' });
//         }
//         const updatedHomeData = await HomeData.findByPk(req.params.id);
//         return res.status(200).json(updatedHomeData);
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };
 
// Get all deleted HomeData entries
const getDeletedHomeData = async (req, res) => {
    try {
        const deletedData = await HomeData.findAll({
            where: {
                deleted_at: {
                    [Op.ne]: null
                }
            },
            order: [['deleted_at', 'DESC']]
        });
        res.json(deletedData);
    } catch (error) {
        console.error('Error fetching deleted data:', error);
        res.status(500).json({ message: 'Error fetching deleted data' });
    }
};

// Delete HomeData (soft delete)
const deleteHomeData = async (req, res) => {
    try {
        const { id } = req.params;
        const { deleted_at } = req.body;

        const homeData = await HomeData.findByPk(id);
        if (!homeData) {
            return res.status(404).json({ message: 'HomeData not found' });
        }

        // Update the record with deleted_at timestamp instead of actually deleting it
        await homeData.update({
            deleted_at: deleted_at || new Date()
        });

        res.json({ message: 'HomeData deleted successfully' });
    } catch (error) {
        console.error('Error deleting HomeData:', error);
        res.status(500).json({ message: 'Error deleting HomeData' });
    }
};
 
const getEmployeePaidHomeData = async (req, res) => {
    try {
        const { id } = req.params;
        
        const homeDataList = await HomeData.findAll({
            where: {
                payment_status: 'paid',
                emp_id: id
            },
            include: [{
                model: Employee,
                as: 'employee', 
                attributes: ['name', 'last_loginat', 'last_logoutat']
            }]
        });
        
        return res.status(200).json(homeDataList);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getEmployeePendingHomeData = async (req, res) => {
    try {
        const {id} = req.params;
        
        const homeDataList = await HomeData.findAll({
            where: {
                payment_status: 'pending',
                emp_id: id
            },
            include: [{
                model: Employee,
                as: 'employee',
                attributes: ['name', 'last_loginat', 'last_logoutat']
            }]
        });

        return res.status(200).json(homeDataList);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getEmployeeAllHomeData = async (req, res) => {
    try {
        const { id } = req.params;
        
        const homeDataList = await HomeData.findAll({
            where: {
                emp_id: id
            }
        });
        
        return res.status(200).json(homeDataList);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getUserRechargeHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // First find the user to verify they exist
        const user = await User.findOne({
            where: { uid:userId }
        });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Get all recharge history where mobile_number matches user's phone
        const rechargeHistory = await HomeData.findAll({
            where: {
                userId: userId
            },
            order: [['payment_date', 'DESC']] // Most recent first
        });
        
        return res.status(200).json(rechargeHistory);
    } catch (error) {
        console.error('Error fetching recharge history:', error);
        return res.status(500).json({ error: error.message });
    }
};

// Delete user recharge history
const deleteUserRechargeHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid; // Get user ID from authenticated user

        // Find the recharge record
        const rechargeRecord = await HomeData.findOne({
            where: { 
                id: id,
                userId: userId // Ensure the record belongs to the user
            }
        });

        if (!rechargeRecord) {
            return res.status(404).json({ 
                message: 'Recharge record not found or you do not have permission to delete it' 
            });
        }

        // Delete the record
        await rechargeRecord.destroy();
        
        return res.status(200).json({ 
            message: 'Recharge record deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting recharge history:', error);
        return res.status(500).json({ 
            message: 'Failed to delete recharge record',
            error: error.message 
        });
    }
};

// Permanent delete HomeData
const permanentDeleteHomeData = async (req, res) => {
    try {
        const { id } = req.params;

        const homeData = await HomeData.findByPk(id);
        if (!homeData) {
            return res.status(404).json({ message: 'HomeData not found' });
        }

        // Permanently delete the record
        await homeData.destroy();

        res.json({ message: 'HomeData permanently deleted' });
    } catch (error) {
        console.error('Error permanently deleting HomeData:', error);
        res.status(500).json({ message: 'Error permanently deleting HomeData' });
    }
};

// Add these to your module.exports
module.exports = {
    createHomeData,
    getAllHomeData,
    updatePaymentInfo,
    getAllPendingHomeData,
    getAllPaidHomeData,
    getHomeDataById,
    // updateHomeData,
    deleteHomeData,
    getEmployeePendingHomeData,
    getEmployeePaidHomeData,    // Added
    getEmployeeAllHomeData ,
    getUserRechargeHistory,
    deleteUserRechargeHistory,    // Add the new controller
    getDeletedHomeData,
    permanentDeleteHomeData
};
 