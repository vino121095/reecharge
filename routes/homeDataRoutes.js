const express = require('express');
const router = express.Router();
const {
    homeDataValidator,
    validate,
} = require('../helpers/homeDataValidator');
const {
    createHomeData,
    getAllHomeData,
    updatePaymentInfo,
    getAllPendingHomeData,
    getAllPaidHomeData,
    getHomeDataById,
    updateHomeData,
    deleteHomeData,
    getEmployeePendingHomeData,
    getEmployeePaidHomeData,    
    getEmployeeAllHomeData,
    getUserRechargeHistory,
    deleteUserRechargeHistory,
    getDeletedHomeData,
    permanentDeleteHomeData
} = require('../controllers/homeDataControllers');
const { authenticateToken } = require('../controllers/userController');

// Create new HomeData entry
router.post('/home_data', homeDataValidator, validate, createHomeData);
 
// Get all HomeData entries
router.get('/home_data', getAllHomeData);

// In your routes file
router.put('/home_data/payment/:id', updatePaymentInfo);

// Get pending home data
router.get('/home_data/pending', getAllPendingHomeData);

// Get paid home data
router.get('/home_data/paid', getAllPaidHomeData);

// Get deleted HomeData entries
router.get('/home_data/deleted', getDeletedHomeData);

// Get HomeData by ID
router.get('/home_data/:id', getHomeDataById);
 
// // Update HomeData entry
// router.put('/home_data/:id', homeDataValidator, validate, updateHomeData);
 
// Delete HomeData entry
router.delete('/home_data/:id', deleteHomeData);

// Permanent delete HomeData
router.delete('/home_data/permanent/:id', permanentDeleteHomeData);

router.get('/home_data/getemployeedata/:id', getEmployeePendingHomeData);

router.get('/home_data/employee/:id', getEmployeeAllHomeData);

// Route to get paid home data for a specific employee
router.get('/home_data/paid/employee/:id', getEmployeePaidHomeData);

router.get('/home_data/user/phone/:userId', getUserRechargeHistory);

// Delete user recharge history (protected route)
router.delete('/home_data/user/:id', authenticateToken, deleteUserRechargeHistory);

module.exports = router;
 