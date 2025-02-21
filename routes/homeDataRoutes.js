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
} = require('../controllers/homeDataControllers');
 
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
 
// Get HomeData by ID
router.get('/home_data/:id', getHomeDataById);
 
// // Update HomeData entry
// router.put('/home_data/:id', homeDataValidator, validate, updateHomeData);
 
// // Delete HomeData entry
// router.delete('/home_data/:id', deleteHomeData);
 
module.exports = router;
 
