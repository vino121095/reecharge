import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import AdminLayout from '../AdminLayout';
import baseurl from '../../Api Service/ApiService';

const UserList = () => {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [editModalShow, setEditModalShow] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [employeeId, setEmployeeId] = useState(null);
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [userRole, setUserRole] = useState('');
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return dateString;
    
    // Format date: DD-MM-YYYY HH:mm
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const fetchPendingData = async () => {
    try {
      const userRoleFromSession = localStorage.getItem('userType') || 'employee';
      const employeeIdFromSession = JSON.parse(localStorage.getItem('employeeId'));
      console.log(" Retrieved from localStorage -> Role:", userRoleFromSession, "| Employee ID:", employeeIdFromSession);
      setUserRole(userRoleFromSession);
      setEmployeeId(employeeIdFromSession);

       // Fetch active employees
       console.log(" Fetching active employees...");
       const activeEmployeesResponse = await fetch(`${baseurl}/api/active-employees`);
       if (!activeEmployeesResponse.ok) throw new Error(" Failed to fetch active employees.");
       const activeEmployeesData = await activeEmployeesResponse.json();
       console.log(" Active Employees:", activeEmployeesData);

       setActiveEmployees(activeEmployeesData.data);

      const response = await fetch(`${baseurl}/api/home_data/pending`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      let sanitizedData = data.map(user => ({
        ...user,
        plan_type: user.plan_type || '',
        mobile_number: user.mobile_number || '',
        operator: user.operator || '',
        createdAt: user.createdAt || '',
        updatedAt: user.updatedAt || '',
        user_name: user.user_name || '',
        status: user.payment_status || 'pending'
      }));
       //  Recharge distribution logic for employees (No status check)
       if (userRoleFromSession === 'employee') {
        console.log(" Employee detected, distributing recharges...");
        
        if (sanitizedData.length >= 1) {
          console.log(" Data size is sufficient for distribution.");

          const employeeCount = activeEmployeesData.data.length;
          const rechargesPerEmployee = Math.floor(sanitizedData.length / employeeCount);
          console.log(`ℹ️ Total Employees: ${employeeCount}, Recharges per Employee: ${rechargesPerEmployee}`);

          const employeeId = employeeIdFromSession;
          if (!employeeId) {
              console.error(" Employee ID is missing or invalid.");
              return;
          }

          if (!activeEmployeesData || activeEmployeesData.length === 0) {
              console.error(" No active employees found.");
              return;
          }

          const employeeIndex = activeEmployeesData.data.findIndex(emp => emp.eid === employeeId);
          console.log(`ℹ️ Employee Index: ${employeeIndex}`);

          if (employeeIndex === -1) {
              console.error(` Employee ID ${employeeId} not found in active employees list.`);
              return;
          }

          const startIndex = employeeIndex * rechargesPerEmployee;
          let endIndex = startIndex + rechargesPerEmployee;

          // Ensure the last employee gets any remaining recharges
          if (employeeIndex === employeeCount - 1) {
            endIndex = sanitizedData.length;
          }

          console.log(` Assigning recharges -> Start: ${startIndex}, End: ${endIndex}`);

          // Assign only the portion of recharges this employee is responsible for
          sanitizedData = sanitizedData.slice(startIndex, endIndex);
          console.log(" Assigned Recharge Data:", sanitizedData);
        } else {
          setOperators(sanitizedData);
          console.log(" Not enough data to distribute.");
        }
      } else {
        console.log(" Admin detected, no data distribution needed.");
      }
      setOperators(sanitizedData);
      setLoading(false);
    } catch (error) {
      console.error("Error Occurred:", error.message);
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingData();
    const interval = setInterval(fetchPendingData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleEditClick = (user) => {
    setCurrentUser(user);
    setNewStatus(user.status);
    setEditModalShow(true);
  };

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleSaveEdit = async () => {
    try {
      if (!currentUser) return;

      const response = await fetch(`${baseurl}/api/home_data/payment/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_status: newStatus,
          payment_date: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      // Refresh the pending data
      await fetchPendingData();
      setEditModalShow(false);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const updatedOperators = operators.filter(op => op.id !== userId);
        setOperators(updatedOperators);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleView = (user) => {
    setViewUser(user);
    setShowView(true);
  };

  const handleCloseView = () => {
    setShowView(false);
    setViewUser(null);
  };

  // Filter and sort logic
  const filteredUsers = operators.filter((user) => {
    const searchableFields = [
      user.operator,
      user.user_name,
      user.mobile_number
    ].map(field => (field || '').toLowerCase());
    
    return searchableFields.some(field => 
      field.includes(searchTerm.toLowerCase())
    );
  });

  const sortedUsers = filteredUsers.sort((a, b) => {
    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    return sortConfig.direction === 'ascending' 
      ? aValue > bValue ? 1 : -1 
      : aValue < bValue ? 1 : -1;
  });

  const totalItems = sortedUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return (
    <AdminLayout>
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </AdminLayout>
  );

  if (error) return (
    <AdminLayout>
      <div className="alert alert-danger m-4" role="alert">
        Error: {error}
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="container-fluid mt-4">
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">User List {userRole === 'admin' ? '(Admin View)' : '(Employee View)'}</h5>
          </div>
          <div className="card-body">
            {/* Search and Filter Controls */}
            <div className="row mb-3">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by Operator, Username, or Phone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-2 ms-auto">
                <select 
                  className="form-select"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page when changing items per page
                  }}
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                      S No {sortConfig.key === 'id' && (
                        <i className={`bi bi-arrow-${sortConfig.direction === 'ascending' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('user_name')} style={{ cursor: 'pointer' }}>
                      Username {sortConfig.key === 'user_name' && (
                        <i className={`bi bi-arrow-${sortConfig.direction === 'ascending' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th>Phone Number</th>
                    <th>Operator</th>
                    <th>Type</th>
                    <th>Date & Time</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center">No records found</td>
                    </tr>
                  ) : (
                    currentItems.map((user, index) => (
                      <tr key={user.id}>
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td>{user.username}</td>
                        <td>{user.mobile_number}</td>
                        <td>{user.operator}</td>
                        <td>{user.plan_type}</td>
                        <td>{formatDateTime(user.payment_date)}</td>
                        <td>₹{user.amount}</td>
                        <td>
                            {user.status}
                        </td>
                        <td>
                          <button
                            className="btn btn-link p-0 me-2"
                            onClick={() => handleView(user)}
                          >
                            <i className="bi bi-eye-fill text-primary"></i>
                          </button>
                          <button
                            className="btn btn-link p-0 me-2"
                            onClick={() => handleEditClick(user)}
                          >
                            <i className="bi bi-pencil-fill text-warning"></i>
                          </button>
                          <button
                            className="btn btn-link p-0"
                            onClick={() => handleDelete(user.id)}
                          >
                            <i className="bi bi-trash-fill text-danger"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-3">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      Previous
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => (
                    <li 
                      key={i + 1} 
                      className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                    >
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>

        {/* View Modal */}
        {showView && viewUser && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">User Details</h5>
                  <button type="button" className="btn-close" onClick={handleCloseView}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-2"><strong>Username:</strong> {viewUser.username}</div>
                  <div className="mb-2"><strong>Phone Number:</strong> {viewUser.mobile_number}</div>
                  <div className="mb-2"><strong>Operator:</strong> {viewUser.operator}</div>
                  <div className="mb-2"><strong>Type:</strong> {viewUser.plan_type}</div>
                  <div className="mb-2"><strong>Created At:</strong> {formatDateTime(viewUser.payment_date)}</div>
                  <div className="mb-2">
                    <strong>Status:</strong>
                      {viewUser.status}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseView}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editModalShow && currentUser && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Status</h5>
                  <button type="button" className="btn-close" onClick={() => setEditModalShow(false)}></button>
                </div>
                <div className="modal-body">
                  <select
                    className="form-select"
                    value={newStatus}
                    onChange={handleStatusChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setEditModalShow(false)}
                  >
                    Close
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleSaveEdit}
                    disabled={!newStatus}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Backdrop */}
        {(showView || editModalShow) && <div className="modal-backdrop show"></div>}
      </div>
    </AdminLayout>
  );
};

export default UserList;