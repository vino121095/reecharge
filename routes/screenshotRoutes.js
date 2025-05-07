const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');
const { uploadScreenshot, getScreenshot } = require('../controllers/screenshotController');

// Route for uploading screenshots
router.post('/upload-screenshot', upload.single('screenshot'), uploadScreenshot);

// Route for getting a screenshot
router.get('/screenshot/:id', getScreenshot);

module.exports = router;