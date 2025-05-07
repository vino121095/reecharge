const HomeData = require('../models/homeData');
const fs = require('fs');
const path = require('path');

const uploadScreenshot = async (req, res) => {
    try {
        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Get the payment ID from the request
        const { paymentId } = req.body;
        
        if (!paymentId) {
            // Remove uploaded file if paymentId is not provided
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Payment ID is required' });
        }

        // Find the home data record
        const homeData = await HomeData.findByPk(paymentId);
        
        if (!homeData) {
            // Remove uploaded file if home data record is not found
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: 'Payment record not found' });
        }

        // Update the home data record with the file path
        await homeData.update({
            screenshot_path: req.file.path,
            screenshot_uploaded_at: new Date()
        });

        return res.status(200).json({
            message: 'Screenshot uploaded successfully',
            filepath: req.file.path,
            filename: req.file.filename
        });
    } catch (error) {
        // If there was an error and a file was uploaded, remove it
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }

        return res.status(500).json({ error: error.message });
    }
};

const getScreenshot = async (req, res) => {
    try {
        const { id } = req.params;
        
        const homeData = await HomeData.findByPk(id);
        
        if (!homeData) {
            return res.status(404).json({ error: 'Payment record not found' });
        }
        
        if (!homeData.screenshot_path) {
            return res.status(404).json({ error: 'No screenshot found for this payment' });
        }
        
        // Construct absolute path
        const absolutePath = path.join(__dirname, '..', homeData.screenshot_path);
        
        // Check if file exists
        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({ error: 'Screenshot file not found' });
        }
        
        // Determine content type based on file extension
        const ext = path.extname(absolutePath).toLowerCase();
        let contentType = 'image/jpeg'; // default
        if (ext === '.png') contentType = 'image/png';
        else if (ext === '.gif') contentType = 'image/gif';
        
        // Send the file with proper headers
        res.setHeader('Content-Type', contentType);
        fs.createReadStream(absolutePath).pipe(res);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    uploadScreenshot,
    getScreenshot
};