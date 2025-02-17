const express = require('express');
const addEmployeeController = require('../controllers/addEmployeeController');
const router = express.Router();

//Employee Register
router.post('/employees', addEmployeeController.createEmployee);
router.get('/employees', addEmployeeController.getAllEmployees);
router.get('/active-employees', addEmployeeController.getAllActiveEmployees);
router.get('/employees/:id', addEmployeeController.getEmployeeById);
router.put('/employees/:id', addEmployeeController.updateEmployee);
router.delete('/employees/:id', addEmployeeController.deleteEmployee);

//Employe Login
router.post('/employees-login', addEmployeeController.employeeLogin);
router.post('/employees-logout', addEmployeeController.employeeLogout);

module.exports = router;