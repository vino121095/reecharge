const Employee = require('../models/addEmployee'); // Adjust path if necessary
const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken'); // For JWT token generation
const HomeData = require('../models/homeData');
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

        // Update login status and time for this employee
        await Employee.update(
            {
                is_active: true,
                last_loginat: new Date()
            },
            { where: { email: employee.email } }
        );

        // DISTRIBUTION LOGIC
        // First, reset all pending records to unassigned state
        await HomeData.update(
            { emp_id: null },
            { 
                where: { payment_status: 'pending' }
            }
        );
        
        // Get all active employees (including the one that just logged in)
        const activeEmployees = await Employee.findAll({
            where: { is_active: true },
            order: [['eid', 'ASC']] // Ensure consistent ordering
        });
        
        // Get all pending records
        const pendingRecords = await HomeData.findAll({
            where: { payment_status: 'pending' },
            order: [['id', 'ASC']] // Ensure consistent ordering
        });
        
        if (activeEmployees.length > 0 && pendingRecords.length > 0) {
            // Calculate records per employee
            const totalEmployees = activeEmployees.length;
            const baseRecordsPerEmployee = Math.floor(pendingRecords.length / totalEmployees);
            const extraRecords = pendingRecords.length % totalEmployees;
            
            let assignedIndex = 0;
            
            // Distribute records among active employees
            for (let i = 0; i < totalEmployees; i++) {
                const empId = activeEmployees[i].eid;
                // Calculate how many records this employee should get
                // Extra records are distributed one per employee until used up
                const recordsForThisEmployee = baseRecordsPerEmployee + (i < extraRecords ? 1 : 0);
                
                if (recordsForThisEmployee > 0) {
                    // Get the slice of records for this employee
                    const employeeRecords = pendingRecords
                        .slice(assignedIndex, assignedIndex + recordsForThisEmployee)
                        .map(record => record.id);
                    
                    // Update these records with this employee's ID
                    if (employeeRecords.length > 0) {
                        await HomeData.update(
                            { emp_id: empId },
                            { 
                                where: { 
                                    id: employeeRecords,
                                    payment_status: 'pending'
                                } 
                            }
                        );
                    }
                    
                    // Update the index for the next batch
                    assignedIndex += recordsForThisEmployee;
                }
            }
        }

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
            employeeId: employee.eid
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.employeeLogout = async (req, res) => {
    try {
        const { email } = req.body;
        const employee = await Employee.findOne({ where: { email } });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        
        // Update employee status to inactive
        await Employee.update(
            {
                is_active: false
            },
            { where: { email } }
        );

        // REDISTRIBUTION LOGIC
        // First, clear records assigned to this employee
        await HomeData.update(
            { emp_id: null },
            { 
                where: { 
                    payment_status: 'pending',
                    emp_id: employee.eid 
                } 
            }
        );

        // Get all active employees after this employee logged out
        const activeEmployees = await Employee.findAll({
            where: { is_active: true },
            order: [['eid', 'ASC']] // Ensure consistent ordering
        });
        
        // Get all pending unassigned records (those that belonged to the logged out employee)
        const pendingRecords = await HomeData.findAll({
            where: {
                payment_status: 'pending',
                emp_id: null
            },
            order: [['id', 'ASC']] // Ensure consistent ordering
        });
        
        // Redistribute work if there are still active employees and pending records
        if (activeEmployees.length > 0 && pendingRecords.length > 0) {
            // Calculate records per employee
            const totalEmployees = activeEmployees.length;
            const baseRecordsPerEmployee = Math.floor(pendingRecords.length / totalEmployees);
            const extraRecords = pendingRecords.length % totalEmployees;
            
            let assignedIndex = 0;
            
            // Distribute records among active employees
            for (let i = 0; i < totalEmployees; i++) {
                const empId = activeEmployees[i].eid;
                // Calculate how many records this employee should get
                // Extra records are distributed one per employee until used up
                const recordsForThisEmployee = baseRecordsPerEmployee + (i < extraRecords ? 1 : 0);
                
                if (recordsForThisEmployee > 0) {
                    // Get the slice of records for this employee
                    const employeeRecords = pendingRecords
                        .slice(assignedIndex, assignedIndex + recordsForThisEmployee)
                        .map(record => record.id);
                    
                    // Update these records with this employee's ID
                    if (employeeRecords.length > 0) {
                        await HomeData.update(
                            { emp_id: empId },
                            { 
                                where: { 
                                    id: employeeRecords,
                                    payment_status: 'pending',
                                    emp_id: null
                                } 
                            }
                        );
                    }
                    
                    // Update the index for the next batch
                    assignedIndex += recordsForThisEmployee;
                }
            }
        }

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Error during logout', error: error.toString() });
    }
};

exports.getAllActiveEmployees = async (req, res) => {
    try {
        const activeEmployees = await Employee.findAll({
            where: {
                is_active: true
            },
            order: [['eid', 'ASC']] // Ensure consistent ordering
        });
        
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

// New function to redistribute all pending records among all active employees
// Can be called manually if needed
exports.redistributePendingRecords = async (req, res) => {
    try {
        // Reset all pending records to unassigned state
        await HomeData.update(
            { emp_id: null },
            { 
                where: { payment_status: 'pending' }
            }
        );
        
        // Get all active employees
        const activeEmployees = await Employee.findAll({
            where: { is_active: true },
            order: [['eid', 'ASC']] // Ensure consistent ordering
        });
        
        // Get all pending records
        const pendingRecords = await HomeData.findAll({
            where: { payment_status: 'pending' },
            order: [['id', 'ASC']] // Ensure consistent ordering
        });
        
        if (activeEmployees.length === 0) {
            return res.status(200).json({ 
                message: 'No active employees found for redistribution',
                redistributed: false
            });
        }
        
        if (pendingRecords.length === 0) {
            return res.status(200).json({ 
                message: 'No pending records found for redistribution',
                redistributed: false
            });
        }
        
        // Calculate records per employee
        const totalEmployees = activeEmployees.length;
        const baseRecordsPerEmployee = Math.floor(pendingRecords.length / totalEmployees);
        const extraRecords = pendingRecords.length % totalEmployees;
        
        let assignedIndex = 0;
        let assignmentCount = 0;
        
        // Distribute records among active employees
        for (let i = 0; i < totalEmployees; i++) {
            const empId = activeEmployees[i].eid;
            // Calculate how many records this employee should get
            // Extra records are distributed one per employee until used up
            const recordsForThisEmployee = baseRecordsPerEmployee + (i < extraRecords ? 1 : 0);
            
            if (recordsForThisEmployee > 0) {
                // Get the slice of records for this employee
                const employeeRecords = pendingRecords
                    .slice(assignedIndex, assignedIndex + recordsForThisEmployee)
                    .map(record => record.id);
                
                // Update these records with this employee's ID
                if (employeeRecords.length > 0) {
                    await HomeData.update(
                        { emp_id: empId },
                        { 
                            where: { 
                                id: employeeRecords,
                                payment_status: 'pending'
                            } 
                        }
                    );
                    assignmentCount += employeeRecords.length;
                }
                
                // Update the index for the next batch
                assignedIndex += recordsForThisEmployee;
            }
        }

        res.status(200).json({ 
            message: 'Pending records redistributed successfully',
            activeEmployees: activeEmployees.length,
            pendingRecords: pendingRecords.length,
            assignedRecords: assignmentCount,
            redistributed: true
        });
    } catch (error) {
        console.error('Redistribution error:', error);
        res.status(500).json({ 
            message: 'Error during redistribution', 
            error: error.toString(),
            redistributed: false
        });
    }
};