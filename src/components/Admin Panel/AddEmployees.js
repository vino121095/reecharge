import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import AdminLayout from '../AdminLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function AddEmployees() {
    const [employeeName, setEmployeeName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [employeeList, setEmployeeList] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);

    const [modalShow, setModalShow] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState(null);
    const [modalImagePreview, setModalImagePreview] = useState(null);

    const filteredEmployees = employeeList.filter(employee =>
        employee.name && employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedEmployees = filteredEmployees.sort((a, b) => {
        const aValue = a[sortConfig.key]?.toLowerCase() || "";
        const bValue = b[sortConfig.key]?.toLowerCase() || "";
        return (aValue < bValue ? -1 : 1) * (sortConfig.direction === 'ascending' ? 1 : -1);
    });

    const handleSort = (key) => {
        const direction = sortConfig.key === key && sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
        setSortConfig({ key, direction });
    };

    const totalItems = sortedEmployees.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentItems = sortedEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const employeeData = { name: employeeName, email, phone, password };
        try {
            const response = await axios.post('https://recharge.rbtamilan.in/api/employees', employeeData);
            alert('Employee Registration successful!');
            setEmployeeList(prevList => [...prevList, response.data]);
            resetForm();
        } catch (error) {
            alert('Error adding employee. Please try again.');
        }
    };

    useEffect(() => {
        const fetchEmployees = async () => {
            const response = await axios.get('https://recharge.rbtamilan.in/api/employees');
            setEmployeeList(response.data);
        };
        fetchEmployees();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://recharge.rbtamilan.in/api/employees/${id}`);
            setEmployeeList(employeeList.filter(emp => emp.eid !== id));
        } catch (error) {
            alert('Error deleting employee. Please try again.');
        }
    };

    const handleEdit = (emp) => {
        setCurrentEmployee(emp);
        setEmployeeName(emp.name);
        setEmail(emp.email);
        setPhone(emp.phone);
        setPassword(''); // Reset password for edit
        setModalShow(true);
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        if (!currentEmployee) return;

        const updatedData = {
            name: employeeName,
            email,
            phone,
            password,
        };

        try {
            const response = await axios.put(`https://recharge.rbtamilan.in/api/employees/${currentEmployee.eid}`, updatedData);
            setEmployeeList(prevList => prevList.map(emp => (emp.eid === currentEmployee.eid ? response.data : emp)));
            resetModal();
        } catch (error) {
            alert('Error updating employee. Please try again.');
        }
    };

    const resetForm = () => {
        setEmployeeName('');
        setEmail('');
        setPhone('');
        setPassword('');
    };

    const resetModal = () => {
        setModalShow(false);
        setCurrentEmployee(null);
        setModalImagePreview(null);
    };

    return (
        <AdminLayout>
            <div className="container mt-4">
                <h3 id="employees">Add Employees</h3>
                <div className="card mt-4">
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            {/* Employee form fields */}
                            <div className="mb-3 row">
                                <div className="col-md-5">
                                    <label htmlFor="employeeName" className="col-form-label">Employee Name</label>
                                    <input type="text" id="employeeName" className="form-control" placeholder="Enter employee name"
                                        value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} required />
                                    <label htmlFor="email" className="col-form-label mt-3">Email</label>
                                    <input type="email" id="email" className="form-control" placeholder="Enter email"
                                        value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    <label htmlFor="phone" className="col-form-label mt-3">Phone</label>
                                    <input type="text" id="phone" className="form-control" placeholder="Enter phone number"
                                        value={phone} onChange={(e) => setPhone(e.target.value)} required />
                                    <label htmlFor="password" className="col-form-label mt-3">Password</label>
                                    <div className="input-group">
                                        <input type={passwordVisible ? 'text' : 'password'} className="form-control"
                                            id="password" placeholder="Password" value={password}
                                            onChange={(e) => setPassword(e.target.value)} required />
                                        <span className="input-group-text" onClick={togglePasswordVisibility} style={{ cursor: 'pointer' }}>
                                            <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} />
                                        </span>
                                    </div>
                                    <button type="submit" className="btn btn-primary mt-3">Add</button>
                                </div>
                            </div>
                        </form>
                        <h3 className="mt-4">Employees List</h3>
                        <div className="mb-4 mt-4 row justify-content-between">
                            <div className="col-md-6">
                                <input type="text" className="form-control" placeholder="Search Employees"
                                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <div className="col-md-2">
                                <select className="form-select" value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ height: '450px', overflowY: 'auto' }}>
                            <table className="table text-center">
                                <thead>
                                    <tr>
                                        <th>S No</th>
                                        <th>Employee Id</th>
                                        <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                                            Employee Name
                                            {sortConfig.key === 'name' && (
                                                <i className={`bi ${sortConfig.direction === 'ascending' ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                                            )}
                                        </th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((emp, index) => (
                                        <tr key={emp.eid}>
                                            <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                            <td>{emp.eid}</td>
                                            <td>{emp.name}</td>
                                            <td>{emp.email}</td>
                                            <td>{emp.phone}</td>
                                            <td>
                                                <i
                                                    className="bi bi-pencil-fill"
                                                    onClick={() => handleEdit(emp)}
                                                    style={{ cursor: "pointer", color: "#007bff", marginRight: "10px" }}
                                                />
                                                <i
                                                    className="bi bi-trash-fill"
                                                    onClick={() => handleDelete(emp.eid)}
                                                    style={{ cursor: "pointer", color: "red" }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination Controls */}
                        <nav aria-label="Page navigation">
                            <ul className="pagination justify-content-center">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
                                </li>
                                {Array.from({ length: totalPages }, (_, index) => (
                                    <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(index + 1)}>{index + 1}</button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
            {modalShow && (
                <div className="modal fade show" style={{ display: 'block' }} onClick={resetModal}>
                    <div className="modal-dialog modal-lg modal-dialog-centered" onClick={e => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Employee</h5>
                                <button type="button" className="btn-close" onClick={resetModal}></button>
                            </div>
                            <form onSubmit={handleModalSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="col-form-label">Employee Name</label>
                                        <input type="text" className="form-control"
                                            value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="col-form-label">Email</label>
                                        <input type="email" className="form-control"
                                            value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="col-form-label">Phone</label>
                                        <input type="text" className="form-control"
                                            value={phone} onChange={(e) => setPhone(e.target.value)} required />
                                    </div>
                                    {/* <div className="mb-3">
                                        <label className="col-form-label">Password (Leave blank to keep unchanged)</label>
                                        <input type={passwordVisible ? 'text' : 'password'} className="form-control"
                                            value={password} onChange={(e) => setPassword(e.target.value)} />
                                        <span className="input-group-text" onClick={togglePasswordVisibility} style={{ cursor: 'pointer' }}>
                                            <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} />
                                        </span>
                                    </div> */}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={resetModal}>Close</button>
                                    <button type="submit" className="btn btn-primary">Save changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default AddEmployees;
