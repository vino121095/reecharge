const Admin = require('../models/admin'); // Make sure to point to your SQL model
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Admin registration
const admin = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation errors',
                errors: errors.array(),
            });
        }

        const { email, password } = req.body;
        const isExistUser = await Admin.findOne({ where: { email } });
        if (isExistUser) {
            return res.status(400).json({
                success: false,
                msg: 'Email already exists!',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await Admin.create({
            email,
            password: hashedPassword,
        });

        return res.status(201).json({
            success: true,
            msg: 'Registered Successfully!',
            data: {
                email: newAdmin.email,
                aid: newAdmin.aid,
                createdAt: newAdmin.createdAt,
                updatedAt: newAdmin.updatedAt,
            },
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: 'An error occurred',
            error: error.message,
        });
    }
};

// Generate access token
const generateAccessToken = (newAdmin) => {
    return jwt.sign(newAdmin, process.env.ACCESS_SECRET_TOKEN, { expiresIn: "2h" });
};

// Admin login
const adminLogin = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation errors',
                errors: errors.array(),
            });
        }

        const { email, password } = req.body;
        const adminData = await Admin.findOne({ where: { email } });

        if (!adminData) {
            return res.status(400).json({
                success: false,
                msg: 'Email & Password are incorrect!',
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, adminData.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                msg: 'Email & Password are incorrect!',
            });
        }

        const accessToken = generateAccessToken({ aid: adminData.aid, email: adminData.email });
        return res.status(200).json({
            success: true,
            msg: 'Login Successfully!',
            accessToken,
            tokenType: 'Bearer',
            data: {
                email: adminData.email,
                aid: adminData.aid,
                createdAt: adminData.createdAt,
                updatedAt: adminData.updatedAt,
            },
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message,
        });
    }
};

module.exports = {
    admin,
    adminLogin,
};
