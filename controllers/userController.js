const User = require('../models/user');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
    try {
        const { name, phone, password, confirm_password } = req.body;

        // Validate required fields
        if (!name || !phone || !password || !confirm_password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Validate phone number format (10 digits)
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number.' });
        }

        // Check if passwords match
        if (password !== confirm_password) {
            return res.status(400).json({ message: 'Passwords do not match.' });
        }

        // Check if user already exists with this phone number
        const existingUser = await User.findOne({ where: { phone } });
        if (existingUser) {
            return res.status(400).json({ message: 'Mobile number already registered. Please use a different number.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user with phone number
        const newUser = await User.create({ 
            name, 
            phone, 
            password: hashedPassword 
        });

        // Remove password from response
        const userResponse = {
            uid: newUser.uid,
            name: newUser.name,
            phone: newUser.phone,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt
        };

        res.status(201).json({ 
            message: 'User registered successfully', 
            user: userResponse 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ message: error.message });
    }
}

const generateAccessToken = async (user) => {
    const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, { expiresIn: "2h" });
    return token;
}

const loginUser = async (req, res) => {
    try {
        const { phone, password } = req.body;

        // Validate required fields
        if (!phone || !password) {
            return res.status(400).json({ message: 'Mobile number and password are required.' });
        }

        // Validate phone number format
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number.' });
        }

        // Find user by phone number
        const user = await User.findOne({ where: { phone } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid mobile number or password.' });
        }

        // Compare the password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid mobile number or password.' });
        }

        // Create JWT token for authentication
        const token = jwt.sign(
            { 
                uid: user.uid, 
                phone: user.phone,
                name: user.name 
            }, 
            process.env.JWT_SECRET || 'your_jwt_secret', 
            { expiresIn: '24h' }
        );

        // Send successful login response
        res.status(200).json({ 
            message: 'Login successful', 
            token,
            phone: user.phone,
            name: user.name,
            userid: user.uid, 
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ message: error.message });
    }
}

// Get user profile (optional - for authenticated routes)
const getUserProfile = async (req, res) => {
    try {
        const { uid } = req.user; // This comes from JWT middleware
        
        const user = await User.findOne({ 
            where: { uid },
            attributes: ['uid', 'name', 'phone', 'createdAt', 'updatedAt'] // Exclude password
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Update user profile (optional)
const updateUserProfile = async (req, res) => {
    try {
        const { uid } = req.user; // This comes from JWT middleware
        const { name } = req.body;

        const user = await User.findOne({ where: { uid } });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Update user information (phone number typically shouldn't be changed easily)
        if (name) {
            user.name = name;
        }

        await user.save();

        // Return updated user info (exclude password)
        const userResponse = {
            uid: user.uid,
            name: user.name,
            phone: user.phone,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.status(200).json({ 
            message: 'Profile updated successfully',
            user: userResponse 
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// Change password (optional)
const changePassword = async (req, res) => {
    try {
        const { uid } = req.user; // This comes from JWT middleware
        const { currentPassword, newPassword, confirmNewPassword } = req.body;

        // Validate required fields
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: 'All password fields are required.' });
        }

        // Check if new passwords match
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: 'New passwords do not match.' });
        }

        // Find user
        const user = await User.findOne({ where: { uid } });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({ message: 'Current password is incorrect.' });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// JWT Middleware for protected routes (optional)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    authenticateToken
}