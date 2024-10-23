const express = require('express');
const router = express.Router();
const {
    homeDataValidator,
    validate,
} = require('../helpers/homeDataValidator');
const {
    createHomeData,
    getAllHomeData,
    getHomeDataById,
    updateHomeData,
    deleteHomeData,
} = require('../controllers/homeDataControllers');
 
// Create new HomeData entry
router.post('/home_data', homeDataValidator, validate, createHomeData);
 
// Get all HomeData entries
router.get('/home_data', getAllHomeData);
 
// // Get HomeData by ID
// router.get('/home_data/:id', getHomeDataById);
 
// // Update HomeData entry
// router.put('/home_data/:id', homeDataValidator, validate, updateHomeData);
 
// // Delete HomeData entry
// router.delete('/home_data/:id', deleteHomeData);
 
module.exports = router;
 
