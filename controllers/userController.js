const User = require('../models/user');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
 
const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password, confirm_password } = req.body;
   
        if (password !== confirm_password) {
          return res.status(400).json({ message: 'Passwords do not match.' });
        }
   
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
   
        const newUser = await User.create({ name, email, phone, password: hashedPassword });
        res.status(201).json({ message: 'User registered successfully', user: newUser });
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
 
 
const generateAccessToken = async (user) => {
    const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, { expiresIn: "2h" });
    return token;
}
 
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
   
        if (!user) {
          return res.status(401).json({ message: 'Invalid email or password.' });
        }
   
        // Compare the password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid email or password.' });
        }
   
        // Optional: Create a token for authentication
        const token = jwt.sign({ uid: user.uid, email: user.email }, 'your_jwt_secret', { expiresIn: '1h' });
   
        res.status(200).json({ message: 'Login successful', token });
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
}
 
 
// // Forgot password
// const forgotPassword = async (req, res) => {
//     const { email } = req.body;
 
//     try {
//         const user = await User.findOne({ where: { email } });
//         if (!user) {
//             return res.status(404).json({ message: 'Email not found' });
//         }
 
//         // Generate token
//         const token = jwt.sign({ uid: user.uid }, process.env.JWT_SECRET, { expiresIn: '1h' });
 
//         // Update user with reset token and expiry
//         user.resetToken = token;
//         user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
//         await user.save();
 
//         // Send email with reset link
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS,
//             },
//         });
 
//         const resetLink = `http://localhost:3000/reset-password/${token}`;
//         const mailOptions = {
//             to: email,
//             subject: 'Password Reset',
//             text: `Click on this link to reset your password: ${resetLink}`,
//         };
 
//         transporter.sendMail(mailOptions, (error) => {
//             if (error) {
//                 return res.status(500).json({ message: 'Failed to send email' });
//             }
//             res.json({ message: 'Password reset email sent' });
//         });
//     } catch (err) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };
 
// // Reset password
// const resetPassword = async (req, res) => {
//     const { token, newPassword } = req.body;
 
//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const user = await User.findOne({ where: { uid: decoded.uid } });
 
//         if (!user || user.resetToken !== token || user.resetTokenExpiry < new Date()) {
//             return res.status(401).json({ message: 'Invalid or expired token' });
//         }
 
//         const hashedPassword = bcrypt.hashSync(newPassword, 8);
//         user.password = hashedPassword;
//         user.resetToken = null;  // Clear reset token
//         user.resetTokenExpiry = null;  // Clear expiry
//         await user.save();
 
//         res.json({ message: 'Password has been reset' });
//     } catch (err) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };
 
module.exports = {
    registerUser,
    loginUser,
    // forgotPassword,
    // resetPassword
}