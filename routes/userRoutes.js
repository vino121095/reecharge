const express = require('express');
const router = express.Router();
 
const userController = require('../controllers/userController');
const { registerValidator, loginValidator } = require('../helpers/userValidator');
 
router.post('/register', registerValidator, userController.registerUser);
router.post('/login', loginValidator, userController.loginUser);
// router.post('/forgot-password', forgotPasswordValidator, userController.forgotPassword);
// router.post('/reset-password', resetPasswordValidator, userController.resetPassword);
 
module.exports = router;