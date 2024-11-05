const express = require('express');
const addEmployeeController = require('../controllers/addEmployeeController');
const router = express.Router();

//Employee Register
router.post('/employees', addEmployeeController.createEmployee);
router.get('/employees', addEmployeeController.getAllEmployees);
router.get('/employees/:id', addEmployeeController.getEmployeeById);
router.put('/employees/:id', addEmployeeController.updateEmployee);
router.delete('/employees/:id', addEmployeeController.deleteEmployee);

//Employe Login
router.post('/employees-login', addEmployeeController.employeeLogin);

module.exports = router;
