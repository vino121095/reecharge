const Employee = require('../models/addEmployee'); // Adjust path if necessary
const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken'); // For JWT token generation

// Create a new Employee
exports.createEmployee = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const newEmployee = await Employee.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role,
        });
        res.status(201).json({ message: 'Employee created successfully', employee: newEmployee });
    } catch (error) {
        console.error("Error in createEmployee:", error); // Log the error for debugging
        res.status(500).json({ message: 'Error creating employee', error: error.toString() });
    }
};

// Get all Employees
exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.findAll();
        res.status(200).json(employees);
    } catch (error) {
        console.error("Error in getAllEmployees:", error);
        res.status(500).json({ message: 'Error fetching employees', error: error.toString() });
    }
};

// Get a single Employee by ID
exports.getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findByPk(id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        res.status(200).json(employee);
    } catch (error) {
        console.error("Error in getEmployeeById:", error);
        res.status(500).json({ message: 'Error fetching employee', error: error.toString() });
    }
};

// Update an Employee
exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, password, role } = req.body;

        // Fetch employee by ID
        const employee = await Employee.findByPk(id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        // Update fields
        employee.name = name || employee.name;
        employee.email = email || employee.email;
        employee.phone = phone || employee.phone;
        employee.role = role || employee.role;

        // Update password if provided
        if (password) {
            employee.password = await bcrypt.hash(password, 10);
        }

        // Save changes
        await employee.save();
        res.status(200).json({ message: 'Employee updated successfully', employee });
    } catch (error) {
        console.error("Error in updateEmployee:", error);
        res.status(500).json({ message: 'Error updating employee', error: error.toString() });
    }
};

// Delete an Employee
exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findByPk(id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        await employee.destroy();
        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error("Error in deleteEmployee:", error);
        res.status(500).json({ message: 'Error deleting employee', error: error.toString() });
    }
};


// Function to generate JWT token
const generateAccessToken = (employee) => {
    const token = jwt.sign(employee, process.env.ACCESS_SECRET_TOKEN, { expiresIn: "2h" });
    return token;
};

// Login controller function
exports.employeeLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const employee = await Employee.findOne({ where: { email } });

        if (!employee) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Update login status and time
        await Employee.update(
            {
                is_active: true,
                last_loginat: new Date()
            },
            { where: { email: employee.email } }
        );

        // Generate a token with additional user info
        const token = jwt.sign(
            { 
                eid: employee.eid, 
                email: employee.email,
                role: employee.role 
            }, 
            'your_jwt_secret', 
            { expiresIn: '1h' }
        );

        res.status(200).json({ 
            message: 'Login successful', 
            token,
            userType: employee.role === 'admin' ? 'admin' : 'employee',
            employeeId:employee.eid
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.employeeLogout = async (req, res) => {
    try {
        const { email } = req.body;
        
        await Employee.update(
            {
                is_active: false
            },
            { where: { email } }
        );

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error during logout', error: error.toString() });
    }
};

exports.getAllActiveEmployees = async (req, res) => {
    try {
        const activeEmployees = await Employee.findAll({
            where: {
                is_active: true
            }
        });
        console.log("Active Employees:", activeEmployees);
        
        if (!activeEmployees.length) {
            return res.status(404).json({ 
                message: 'No active employees found',
                data: []
            });
        }

        res.status(200).json({
            message: 'Active employees retrieved successfully',
            data: activeEmployees
        });
    } catch (error) {
        console.error("Error in getAllActiveEmployees:", error);
        res.status(500).json({ 
            message: 'Error fetching active employees', 
            error: error.toString() 
        });
    }
};