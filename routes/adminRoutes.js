const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { adminValidator, adminLoginValidator } = require('../helpers/adminValidator');

router.post('/admin', adminValidator, adminController.admin);
router.post('/adminLogin', adminLoginValidator, adminController.adminLogin);

module.exports = router;
